/*!
 * 
		SAP UI development toolkit for HTML5 (SAPUI5)
		(c) Copyright 2009-2015 SAP SE. All rights reserved
	
 */
sap.ui.define([
    "sap/ui/base/Object",
    "sap/insights/CardHelper"
], function (BaseObject, CardHelper) {
    return BaseObject.extend("sap.insights.CardProvider", {

        /**
         * Constructor for the card provider.
         *
         * @class
         * This class is used to provide cards to consumers like SAP Collaboration Manager.
         * It registers itself with the cards channel and shares available cards with interested consumers.
         * It also handles requests for specific cards from consumers.
         * It can be used to share cards with other applications or components that are interested in them
         * @param {string} sId unique ID to be used for registering the provider
         * @param {Array<sap.insights.CardsChannel.Card>} aCards An array containing available cards
         * @extends sap.ui.base.Object
         * @public
         * @since 1.140
         * @alias sap.insights.CardProvider
         */

        constructor: function (sId, aCards) {
            CardHelper.getServiceAsync().then(function (service) {
                service.getCardsChannel().then(function (channel) {
                    if (channel.isEnabled()) {
                        this.channel = channel;
                        this.id = sId;
                        this.sharedCards = aCards;
                        this.consumers = {};
                        this._registerProvider();
                    }
                }.bind(this));
            }.bind(this));
        },

        /**
         * Register this instance as a card provider.
         * @private
         * @returns {Promise} a promise
         */
        _registerProvider: function () {
            if (this.channel) {
                return this.channel.registerProvider(this.id, this).then(function () {
                    this.registered = true;
                }.bind(this));
            }
        },

        /**
        * Unregister this instance as a card provider.
        * @private
        * @returns {Promise} a promise
        */
        _unregisterProvider: function () {
            if (this.channel) {
                return this.channel.unregister(this.id).then(function () {
                    this.registered = false;
                    this.consumers = {};
                    this.sharedCards = [];
                }.bind(this));
            }
        },

        /**
         * Share the list of available cards with all consumers or if provided, with a specific one.
         * @private
         * @param {string} sConsumerId optional target consumer id. if not provided it will be broadcasted to all
         */
        _shareAvailableCards: function (sConsumerId) {
            var aCardInfo = this.sharedCards.map(function (oCard) {
                return {
                    id: oCard.id,
                    title: oCard.descriptorContent["sap.card"].header.title,
                    parentAppId: oCard.descriptorContent["sap.insights"].parentAppId,
                    description: oCard.descriptorContent["sap.card"].header.subTitle ? oCard.descriptorContent["sap.card"].header.subTitle : ''
                };
            });
            this.channel.publishAvailableCards(this.id, aCardInfo, sConsumerId);
        },

        /**
         * Event handler called by the cards channel when a cards consumer e.g. SAP Collaboration Manager is interested in cards.
         *
         * @param {string} sConsumerId id of the requesting consumer
         * @public
         * @since 1.140
         * @alias sap.insights.CardProvider#onConsumerConnected
         * @this sap.insights.CardProvider
         * @description
         * This method is called when a consumer connects to the cards channel. It checks if the
         * card detail control is loaded, and if not, it loads it. Then it shares the available cards
         * with the consumer and navigates to the card list page.
         * If the card detail control is already loaded, it simply shares the available cards.
         */
        onConsumerConnected: function (sConsumerId) {
            if (!this.consumers[sConsumerId]) {
                this.consumers[sConsumerId] = true;
                this._shareAvailableCards(sConsumerId);
            }
        },

        /**
         * Event handler called by the cards channel when a cards consumer e.g. SAP Collaboration Manager is not interested in cards anymore.
         *
         * @param {string} sConsumerId id of the requesting consumer
         * @public
         * @since 1.140
         * @alias sap.insights.CardProvider#onConsumerDisconnected
         * @this sap.insights.CardProvider
         * @description
         * This method is called when a consumer disconnects from the cards channel. It removes the
         * consumer from the list of consumers and stops sharing cards with it.
         * If the consumer is not registered, it does nothing.
         */
        onConsumerDisconnected: function (sConsumerId) {
            if (this.consumers[sConsumerId]) {
                delete this.consumers[sConsumerId];
            }
        },

        /**
         * Event handler called by the cards channel when a consumer is requesting a specific card.
         *
         * @param {string} sConsumerId id of the requesting consumer
         * @param {string} sCardId unique ID of available card
         * @public
         * @since 1.140
         * @alias sap.insights.CardProvider#onCardRequested
         * @this sap.insights.CardProvider
         * @description
         * This method is called when a consumer requests a specific card. It checks if the consumer
         * is registered and if the card exists in the shared cards. If both conditions are met
         * it publishes the card to the consumer.
         * If the consumer is not registered, it does nothing.
         */
        onCardRequested: function (sConsumerId, sCardId) {
            if (this.consumers[sConsumerId]) {
                var card = this.sharedCards.find(function (card) {
                    return card.id === sCardId;
                });
                if (card) {
                    this.publishCard(this.id, card, sConsumerId);
                }
            }
        },

        /**
         * Event handler called by the myhome controller when anything happened in the Insights section
         *
         * @param {boolean} bActive true if the home page is currently being rendered.
         * @param {Array<sap.insights.CardsChannel.Card>} aCards An array containing available cards
         * @public
         * @since 1.140
         * @alias sap.insights.CardProvider#onViewUpdate
         * @this sap.insights.CardProvider
         * @description
         * This method is called when the view is updated. It checks if the home page is currently
         * being rendered and registers or unregisters the card provider accordingly.
         */
        onViewUpdate: function (bActive, aCards) {
            // register / unregister if the status of the home page changed
            if (this.registered !== bActive) {
                if (bActive) {
                    this._registerProvider().then(function () {
                        this.sharedCards = aCards;
                        this._shareAvailableCards();
                    }.bind(this));
                } else {
                    this._unregisterProvider();
                }
            } else {
                if (this.registered) {
                    this.sharedCards = aCards;
                    this._shareAvailableCards();
                }
            }
        }
    });
});
