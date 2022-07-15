prepare:
	rm -rf ./deploy && mkdir deploy
	
	cd ./deploy && mkdir fivefhc
	cd ./../../
	cd ./target 
		&& cp ./fivefhc.contract.wasm ./../deploy/fivefhc/fivefhc.contract.wasm 
		&& cp ./fivefhc.contract.abi ./../deploy/fivefhc/fivefhc.contract.abi
	

	cd ./deploy && mkdir fivefhcvault
	cd ./../../
	cd ./target 
		&& cp ./fivefhcvault.contract.wasm ./../deploy/fivefhcvault/fivefhc.contract.wasm 
		&& cp ./fivefhcvault.contract.abi ./../deploy/fivefhcvault/fivefhcvault.contract.abi

deploy-testnet:
	cd ./deploy/fivefhc && proton chain:set proton-test && proton contract:set fivefhc ./
	cd ./deploy/fivefhcvault && proton chain:set proton-test && proton contract:set fivefhcvault ./

deploy-mainet: