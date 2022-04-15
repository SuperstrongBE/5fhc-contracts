import { Blockchain } from "@proton/vert";

async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const main = async () => {
  const blockchain = new Blockchain();

  const fivefhc = blockchain.createContract('fivefhc', 'target/fivefhc.contract',true);
  const atomicAsset = blockchain.createContract('atomicassets', 'node_modules/proton-tsc/external/atomicassets/atomicassets',true);
  const minterAccount = blockchain.createAccount('johnson')
  const collName:string = 'collection12';
  const schemaName:string = 'collection12';

  console.log(minterAccount.name.toString())
  await wait(5000);

  // Initialize atomicassets
  await atomicAsset.actions.init().send()
  await atomicAsset.actions.admincoledit([
    [
      { "name": "name", "type": "string" },
      { "name": "img", "type": "ipfs" },
      { "name": "description", "type": "string" },
      { "name": "url", "type": "string" }
    ]
  ]).send()

  // Put you actions calls here
  await atomicAsset.actions.createcol(['fivefhc',collName,true,['fivefhc'],['fivefhc'],0.15,[]]).send('fivefhc@active')
  await atomicAsset.actions.createschema(['fivefhc',collName,schemaName,[
    { "name": "name", "type": "string" },
    { "name": "img", "type": "ipfs" },
    { "name": "description", "type": "string" },
    { "name": "url", "type": "string" },
    { "name": "rl_multiplyer", "type": "uint32" },
    { "name": "og_owner", "type": "string" }
  ]]).send('fivefhc@active');

  await wait(5000);

  await fivefhc.actions.mintitem(['johnson',7,collName,schemaName]).send('fivefhc@active')
}

main()
