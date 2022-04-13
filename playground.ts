import { Blockchain } from "@proton/vert";

async function wait(ms: number) {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

const main = async () => {
  const blockchain = new Blockchain();
  const contract = blockchain.createContract('fivefhc', 'target/fivefhc.contract');
  await wait(0);

  // Put you actions calls here
  await contract.actions.mintitem(['johnson',7]).send('fivefhc@active')
}

main()
