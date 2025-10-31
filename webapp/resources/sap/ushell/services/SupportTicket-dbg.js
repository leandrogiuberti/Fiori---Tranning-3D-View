// Copyright (c) 2009-2025 SAP SE, All Rights Reserved

/**
 * @fileOverview The SupportTicket service.
 */
sap.ui.define([
    "sap/ushell/Config"
], (Config) => {
    "use strict";

    /**
     * @alias sap.ushell.services.SupportTicket
     * @class
     * @classdesc The Unified Shell's SupportTicket service.
     *
     * <b>Note:</b> To retrieve a valid instance of this service, it is necessary to call {@link sap.ushell.Container#getServiceAsync}.
     * <pre>
     *   sap.ui.require(["sap/ushell/Container"], async function (Container) {
     *     const SupportTicket = await Container.getServiceAsync("SupportTicket");
     *     // do something with the SupportTicket service
     *   });
     * </pre>
     *
     * @param {object} oAdapter
     *            the service adapter for the support ticket service,
     *            as already provided by the container
     * @param {object} oContainerInterface
     *            the interface provided by the container
     * @param {string} sParameters
     *            the specified runtime configuration (not evaluated yet)
     * @param {object} oServiceConfiguration
     *            the service configuration defined in the
     *            bootstrap configuration; the boolean property
     *            <code>enabled</code> controls the service enablement
     *
     * This service is disabled by default. It can be enabled explicitly in the
     * bootstrap configuration of the start page:
     * <pre>
     * window[&quot;sap-ushell-config&quot;] = {
     *     services: {
     *         SupportTicket: {
     *             config: {
     *                 enabled: true
     *             }
     *         }
     *     }
     * }
     *
     * Platform implementations can also enable it dynamically by modification of the
     * bootstrap configuration during boot time.
     *
     * @augments sap.ushell.services.Service
     * @hideconstructor
     *
     * @since 1.19.1
     * @public
     */
    function SupportTicket (oAdapter, oContainerInterface, sParameters, oServiceConfiguration) {
        /**
         * Creates a Support Ticket. Forwards the given data (JSON object) to the associated adapter.
         *
         * @param {object} oSupportTicketData JSON object containing the input fields required for the support ticket.
         * @param {string} oSupportTicketData.subject Subject line of the ticket.
         * @param {string} oSupportTicketData.text Long text or description of the support ticket.
         * @param {object} oSupportTicketData.clientContext JSON object containing client-related information.
         *
         * @returns {Promise<string>} Promise, that returns the ID of the generated message
         *
         * @since 1.20.0
         * @public
         */
        this.createTicket = function (oSupportTicketData) {
            return oAdapter.createTicket(oSupportTicketData);
        };

        /**
         * Checks if the service is enabled.
         * <p>
         * The service enablement depends on the configuration in the back-end system and the bootstrap configuration.
         *
         * @returns {boolean} <code>true</code> if the service is enabled; <code>false</code> otherwise
         *
         * @since 1.20.0
         * @public
         */
        this.isEnabled = function () {
            return Config.last("/core/extension/SupportTicket");
        };
    }

    SupportTicket.hasNoAdapter = false;
    return SupportTicket;
}, true /* bExport */);
