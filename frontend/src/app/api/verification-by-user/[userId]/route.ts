import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    console.log('🔍 API Route: Searching Golem DB for user:', userId);

    // Import Golem SDK dynamically to avoid SSR issues
    const { createClient, GenericBytes } = await import('golem-base-sdk');

    // Get environment variables
    const privateKey = process.env.PRIVATE_KEY;
    const rpcUrl = process.env.GOLEM_DB_RPC || 'https://ethwarsaw.holesky.golemdb.io/rpc';
    const wssUrl = process.env.GOLEM_DB_WSS || 'wss://ethwarsaw.holesky.golemdb.io/rpc/ws';
    const appTag = process.env.GOLEM_APP_TAG || 'HumanID';

    if (!privateKey) {
      console.error('❌ PRIVATE_KEY environment variable is required');
      return NextResponse.json(
        { error: 'Server configuration error: Missing private key' },
        { status: 500 }
      );
    }

    console.log('🔧 Connecting to Golem DB...');
    console.log('📡 RPC URL:', rpcUrl);
    console.log('🔌 WSS URL:', wssUrl);
    console.log('🏷️ App Tag:', appTag);

    // Create Golem client
    const client = createClient({
      privateKey,
      rpcUrl,
      wssUrl,
      appTag
    });

    // Get account address (our writer address)
    const writerAddress = client.get_account_address();
    console.log('📝 Writer address:', writerAddress);

    // Get all entities owned by this account
    const entityKeys = await client.get_entities_of_owner(writerAddress);
    console.log('🔍 Found', entityKeys.length, 'entities owned by writer');

    let latestVerification = null;
    let latestTimestamp = null;

    // Search through all entities for matching user_id
    for (const entityKey of entityKeys) {
      try {
        // Get metadata to check annotations
        const metadata = await client.get_entity_metadata(entityKey);

        // Check if this entity matches our user_id and is a humanity verification
        let isTargetUser = false;
        let isHumanityVerification = false;
        let entityTimestamp = null;

        for (const annotation of metadata.string_annotations) {
          if (annotation.key === 'user_id' && annotation.value === userId) {
            isTargetUser = true;
          } else if (annotation.key === 'recordType' && annotation.value === 'humanity_verification') {
            isHumanityVerification = true;
          } else if (annotation.key === 'timestamp') {
            entityTimestamp = annotation.value;
          }
        }

        // If this matches our criteria and is newer than current latest
        if (isTargetUser && isHumanityVerification && entityTimestamp) {
          if (!latestTimestamp || entityTimestamp > latestTimestamp) {
            console.log('📅 Found newer verification:', entityTimestamp);

            // Get the full entity data
            const entityKeyHex = entityKey.as_hex_string();
            const storageValue = await client.get_storage_value(GenericBytes.from_hex_string(entityKeyHex));

            if (storageValue) {
              // Decode the JSON data
              const entityData = JSON.parse(storageValue.toString());

              // Collect all annotations
              const annotations: Record<string, string> = {};
              for (const annotation of metadata.string_annotations) {
                annotations[annotation.key] = annotation.value;
              }

              // Update latest verification
              latestVerification = {
                ...entityData,
                entity_key: entityKeyHex,
                annotations,
                source: 'golem_db_nextjs_api'
              };
              latestTimestamp = entityTimestamp;
            }
          }
        }
      } catch (error) {
        console.warn('⚠️ Error processing entity', entityKey.as_hex_string(), ':', error);
        continue;
      }
    }

    if (latestVerification) {
      console.log('✅ Found latest verification for user', userId);
      return NextResponse.json({
        status: 'success',
        verification: latestVerification
      });
    } else {
      console.log('❌ No verification found for user', userId);
      return NextResponse.json(
        { error: `No verification found for user ${userId}` },
        { status: 404 }
      );
    }

  } catch (error) {
    console.error('❌ Error in API route:', error);
    return NextResponse.json(
      { error: `Failed to fetch verification: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
