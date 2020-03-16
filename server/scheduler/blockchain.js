const debug = require('debug')('zilliqa-social-pay:scheduler');
const zilliqa = require('../zilliqa');
const models = require('../models');

const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
const Blockchain = models.sequelize.models.blockchain;

module.exports = async function() {
  try {
    const blockchainInfo = await zilliqa.blockchainInfo();
    const contractInfo = await zilliqa.getInit();

    let currenInfo = await Blockchain.findOne({
      where: { contract: CONTRACT_ADDRESS }
    });

    if (!currenInfo) {
      debug('cannot find to blockchain info. currenInfo:', currenInfo, 'contracta address', CONTRACT_ADDRESS);

      await Blockchain.create({
        contract: CONTRACT_ADDRESS,
        ...blockchainInfo,
        ...contractInfo
      });

      currenInfo = await Blockchain.findOne({
        where: { contract: CONTRACT_ADDRESS }
      });
    }

    await currenInfo.update({
      ...blockchainInfo,
      ...contractInfo
    });

    debug('blockchain info has been updated.');
  } catch (err) {
    debug('update blockchain info error:', err);
  }
}
