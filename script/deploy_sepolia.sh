# Call script from root directory of repo: ./script/deploy_sepolia.sh

source .env
forge script script/Governance.s.sol:GovernanceScript --private-key $PRIVATE_KEY_SEPOLIA --broadcast --rpc-url $PROVIDER_URI_SEPOLIA -vvvv --verify --etherscan-api-key $ETHERSCAN_API_KEY
cp out/GovernanceNFT.sol/GovernanceNFT.json ./app/src/lib/abi/GovernanceNFT.json
cp out/GovernanceToken.sol/GovernanceToken.json ./app/src/lib/abi/GovernanceToken.json
