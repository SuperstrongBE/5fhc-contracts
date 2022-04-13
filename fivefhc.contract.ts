
import { Asset, Contract,Contracts, Name, requireAuth, Symbol, TableStore,ExtendedSymbol } from 'proton-tsc';

import { Items } from './items.table'

@contract
export class fivefhc extends Contracts.Allow.AllowContract {

  private itemTable:TableStore<Items> = Items.GetTable(this.receiver);
  private static FULL_PRICE:Asset = new Asset(10,new Symbol('foobar',6))
  private static REUCED_PRICE:Asset = new Asset(6,new Symbol('foobar',6))

  @action("mintitem")
  mintitem(owner:Name, rl_multiplier:u32 ): void {
    
    this.checkContractIsNotPaused();
    requireAuth(this.receiver);
    const name:Name = new Name()
    const item:Items = new Items(name,978645123,owner,owner,rl_multiplier);
    Contracts.AtomicAssets.sendMintAsset(this.receiver,this.receiver,Name.fromString('123azer'),Name.fromString('123azer'),1234,owner,[],[],[])
    this.itemTable.set(item,this.receiver);
    

  }
}
