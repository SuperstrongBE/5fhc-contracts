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
  
  
  //Create and issue token 
  /*await xTokensContract.actions.create([contract.name, '5000000000 XPR']).send(`${contract.name}@active`);
  await xTokensContract.actions.issue([contract.name, '1000000000 XPR', '']).send(`${contract.name}@active`);
  await xTokensContract.actions.transfer([contract.name,userAccount.name.toString(), '1000000000 XPR', 'funding']).send(`${contract.name}@active`);
*/
  // await xTokensContract.actions.transfer([userAccount.name,contract.name, '100000 XPR', 'monthly']).send(`${userAccount.name}@active`);

  await wait(0);


  // Initialize atomicassets
  await atomicContract.actions.init().send()
  await atomicContract.actions.admincoledit([
    [
      { "name": "name", "type": "string" },
      { "name": "img", "type": "ipfs" },
      { "name": "description", "type": "string" },
      { "name": "url", "type": "string" }
    ]
  ]).send()

  // Put you actions calls here
  await atomicContract.actions.createcol(['fivefhc', CollectionName, true, ['fivefhc'], ['fivefhc'], 0.15, []]).send('fivefhc@active')
  await atomicContract.actions.createschema(['fivefhc', CollectionName, CollectionName, [
    { "name": "name", "type": "string" },
    { "name": "img", "type": "ipfs" },
    { "name": "description", "type": "string" },
    { "name": "url", "type": "string" },

  ]]).send('fivefhc@active');


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
  ]).send('fivefhc@active')
}

main()
//The collection data
// [
//   {
//     "key": "name",
//     "value": [
//       "string",
//       "A NFT collection"
//     ]
//   },
//   {
//     "key": "description",
//     "value": [
//       "string",
//       "A Nice and sweet NFT collection"
//     ]
//   },
//   {
//     "key": "img",
//     "value": [
//       "string",
//       "QmWnsy3269XJejJvyZjYKtDLJLXwM4CERbiVEURm8EKXni"
//     ]
//   }, {
//     "key": "url",
//     "value": [
//       "string",
//       "https://coolnft.io"
//     ]
//   }
// ]
// //Same as a one liner
// [{ "key": "name", "value": ["string", "A NFT collection"] }, { "key": "description", "value": ["string", "A realy goldies looking NFT"] }, { "key": "img", "value": ["string", "QmWnsy3269XJejJvyZjYKtDLJLXwM4CERbiVEURm8EKXni"] }, { "key": "url", "value": ["string", "https://coolnft.io"] }]
// //////////////////////////////////////////

// //The schema data
// [
//   {
//     "name": "name",
//     "type": "string"
//   },
//   {
//     "name": "img",
//     "type": "ipfs"
//   },
//   {
//     "name": "description",
//     "type": "string"
//   },
//   {
//     "name": "url",
//     "type": "string"
//   }
// ]

// //The Template data
// [{ "key": "name", "value": ["string", "A NFT template"] }, { "key": "description", "value": ["string", "A realy goldies looking NFT"] }, { "key": "img", "value": ["string", "QmWnsy3269XJejJvyZjYKtDLJLXwM4CERbiVEURm8EKXni"] }, { "key": "url", "value": ["string", "https://coolnft.io"] }]