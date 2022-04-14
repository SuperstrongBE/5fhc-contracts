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
  const collName:string = 'coolcool1234';
  const schemaName:string = 'coolcool1234';
  const templateName:string = 'mycool5fhcha'


  await wait(0);

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
    { "name": "url", "type": "string" }
  ]]).send('fivefhc@active');
  const ct = await atomicAsset.actions.createtempl(['fivefhc',collName,schemaName,false,true,10,[]]).send('fivefhc@active');
  console.log ('ct>');
  console.log (atomicAsset.bc.console);
  console.log ('<ct');
  await fivefhc.actions.mintitem(['johnson',7,collName,schemaName]).send('fivefhc@active')
}

main()
