import { Blockchain } from "@proton/vert";
import { CollectionName } from "./fivefhc.constant";


async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const main = async () => {
  const blockchain = new Blockchain();
  
  const xTokensContract = blockchain.createContract('xtokens', 'node_modules/proton-tsc/external/xtokens/xtokens', true);
  //console.log (JSON.stringify(xTokensContract.actions));
  const contract = blockchain.createContract('fivefhc', 'target/fivefhc.contract', true);
  const atomicContract = blockchain.createContract('atomicassets', 'node_modules/proton-tsc/external/atomicassets/atomicassets', true);
  const userAccount = blockchain.createAccount('johnson');
  
  //#################################################################################################################################
  //Create and issue token 
  await wait(0);
  
  await xTokensContract.actions.create([contract.name, '5000000000 XPR']).send(`${xTokensContract.name}@active`);
  await xTokensContract.actions.issue([contract.name, '1000000000 XPR', '']).send(`${contract.name}@active`);
  await xTokensContract.actions.transfer([contract.name,userAccount.name.toString(), '1000000000 XPR', 'funding']).send(`${contract.name}@active`);
  await xTokensContract.actions.transfer([userAccount.name.toString(), contract.name.toString() ,'5 XPR', '5FHC_MINT']).send(`${userAccount.name}@active`);

  //#################################################################################################################################
  // Initialize atomicassets
  // atomicassets Create collection
  // atomicassets Create schema
  await wait(0);

  
  await atomicContract.actions.init().send()
  await atomicContract.actions.admincoledit([
    [
      { "name": "name", "type": "string" },
      { "name": "img", "type": "ipfs" },
      { "name": "description", "type": "string" },
      { "name": "url", "type": "string" }
    ]
  ]).send()

  await atomicContract.actions.createcol(['fivefhc', CollectionName, true, ['fivefhc'], ['fivefhc'], 0.15, []]).send('fivefhc@active')
  await atomicContract.actions.createschema(['fivefhc', CollectionName, CollectionName, [
    { "name": "name", "type": "string" },
    { "name": "img", "type": "ipfs" },
    { "name": "description", "type": "string" },
    { "name": "url", "type": "string" },
    { "name": "rl_multiplyer", "type": "uint32" },
    { "name": "og_owner", "type": "string" },

  ]]).send('fivefhc@active');

  //#################################################################################################################################
  // Core contract calls
  await wait(0);


  await contract.actions.mintitem([userAccount.name, CollectionName, CollectionName,
    [
      { "key": "name", "value": ["string", "Cool NFT"] },
      { "key": "description", "value": ["string", "a realy Cool NFT"] },
      { "key": "img", "value": ["string", "QmP12BGM6pa9e427DVe8K77RjSUSLi6d1ZZsafJxWrvo7j"] },
      { "key": "url", "value": ["string", "https://coolnft.io"] },

    ],
    [
      { "key": "rl_multiplyer", "value": ["uint32", "7"] },
    ]
  ]).send('johnson@active')
}

main()
