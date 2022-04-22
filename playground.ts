import { Blockchain } from "@proton/vert";
import { CollectionName } from "./fivefhc.constant";


async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const main = async () => {
  const blockchain = new Blockchain();

  const fivefhcContract = blockchain.createContract('fivefhc', 'target/fivefhc.contract',true);
  const atomicAsset = blockchain.createContract('atomicassets', 'node_modules/proton-tsc/external/atomicassets/atomicassets',true);
  const johnsonAccount = blockchain.createAccount('johnson')
  const minterAccount = blockchain.createAccount('johnson')
  

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
  await atomicAsset.actions.createcol(['fivefhc',CollectionName,true,['fivefhc'],['fivefhc'],0.15,[]]).send('fivefhc@active')
    await atomicAsset.actions.createschema(['fivefhc',CollectionName,CollectionName,[
      { "name": "name", "type": "string" },
      { "name": "img", "type": "ipfs" },
      { "name": "description", "type": "string" },
      { "name": "url", "type": "string" },
      { "name": "rl_multiplyer", "type": "uint32" },
      { "name": "og_owner", "type": "string" }
    ]]).send('fivefhc@active');

  await wait(5000);

  await fivefhcContract.actions.mintitem(['johnson',7,CollectionName,CollectionName]).send('fivefhc@active')
}

main()
