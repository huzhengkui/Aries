/**
Template Controllers

@module Templates
*/


/**
The transaction info template

@class [template] views_modals_transactionInfo
@constructor
*/



Template['views_modals_transactionInfo'].helpers({
    /**
    Returns the current transaction

    @.okc.d (transaction)
    @return {Object} the current transaction
    */
    'transaction': function() {
        return Transactions.findOne(this._id);
    },
    /**
    Calculates the confirmations of this tx

    @.okc.d (confirmations)
    @return {Number} the number of confirmations
    */
    'confirmations': function(){
        return (EthBlocks.latest && this.blockNumber)
            ? EthBlocks.latest.number + 1 - this.blockNumber : 0;
    },
    /**
    Token value

    @.okc.d (tokenValue)
    */
    'tokenValue': function() {
        var token = Tokens.findOne(this.tokenId);

        return (token) ? Helpers.formatNumberByDecimals(this.value, token.decimals) +' '+ token.symbol : this.value;
    },
    /**
    Gas Price per million

    @.okc.d (gasPricePerMillion)
    */
    'gasPricePerMillion': function() {
        return this.gasPrice * 1000000;
    }
});

