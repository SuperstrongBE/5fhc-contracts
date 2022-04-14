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
  await wait(0);

  // Put you actions calls here
  await atomicAsset.actions.createcol(['fivefhc','coolcool1234',true,['fivefhc'],['fivefhc'],0.15,[]]).send('fivefhc@active')
  await fivefhc.actions.mintitem(['johnson',7]).send('fivefhc@active')
}

main()
