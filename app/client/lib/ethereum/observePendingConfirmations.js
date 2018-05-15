/**
Check if a pending confirmation is still pending

@.okc.d checkConfirmation
*/
checkConfirmation = function(confirmationId){
    var conf = PendingConfirmations.findOne(confirmationId);
    if(!conf) return;

    var wallet = Helpers.getAccountByAddress(conf.from);

    if(conf.operation && wallet && wallet.requiredSignatures > conf.confirmedOwners.length) {
        var removed = false;
        var contract = contracts['ct_'+ wallet._id];

        setTimeout(function(){
            _.each(wallet.owners, function(owner){
                contract.hasConfirmed(conf.operation, owner, function(e, res){
                    if(!removed && !e) {
                        if(res) {
                            PendingConfirmations.update(confirmationId, {$addToSet: {confirmedOwners: owner}});
                        } else {
                            PendingConfirmations.update(confirmationId, {$pull: {confirmedOwners: owner}});
                        }
                        
                        var pendingConf = PendingConfirmations.findOne(confirmationId);

                        if(pendingConf && (!pendingConf.confirmedOwners.length || Number(wallet.requiredSignatures) === pendingConf.confirmedOwners.length)) {
                            PendingConfirmations.remove(confirmationId);
                            removed = true;
                        }
                    }
                });
            });
        }, 1000);
    }
};

/**
Observe pending confirmations

@.okc.d observePendingConfirmations
*/
observePendingConfirmations = function(){
    /**
    Observe PendingConfirmations 

    @class PendingConfirmations({}).observe
    @constructor
    */
    collectionObservers[collectionObservers.length] = PendingConfirmations.find({}).observe({
        /**
        Add pending confirmations to the accounts

        @.okc.d added
        */
        added: function(document) {
            checkConfirmation(document._id);

            if(typeof mist !== 'undefined' && document.confirmedOwners && document.confirmedOwners.length) {
                mist.menu.setBadge(TAPi18n.__('wallet.app.texts.pendingConfirmationsBadge'));
            }
        },
        /**
        Remove pending confirmations from the accounts

        @.okc.d removed
        */
        removed: function(document) {
            updateMistBadge();
        },
        /**
        Add pending confirmations to the accounts

        @.okc.d changed
        */
        changed: function(id, fields) {
            if(typeof mist !== 'undefined' && document.confirmedOwners && document.confirmedOwners.length) {
                mist.menu.setBadge(TAPi18n.__('wallet.app.texts.pendingConfirmationsBadge'));
            }
        }
    });
};