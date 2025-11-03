/*!
 * SAP UI development toolkit for HTML5 (SAPUI5)
 *  * (c) Copyright 2009-2025 SAP SE. All rights reserved
 */

import ResourceBundle from "sap/base/i18n/ResourceBundle";
import GenericTile from "sap/m/GenericTile";
import NewsContent from "sap/m/NewsContent";
import TileContent from "sap/m/TileContent";
import { FrameType, Priority } from "sap/m/library";
import type { MetadataOptions } from "sap/ui/core/Element";
import Element from "sap/ui/core/Element";
import Lib from "sap/ui/core/Lib";
import { $BaseNewsItemSettings } from "./BaseNewsItem";
import { recycleId } from "./utils/DataFormatUtils";

export interface INews {
	url?: string;
	title: string;
	description: string;
	pubDate: string;
	imageUrl: string;
	expandFields?: string;
}

/**
 *
 * Base class for managing and storing News items.
 *
 * @extends sap.ui.core.Element
 *
 * @author SAP SE
 * @version 0.0.1
 * @since 1.121
 *
 * @private
 * @ui5-restricted ux.eng.s4producthomes1
 *
 * @alias sap.cux.home.BaseNewsItem
 */
export default abstract class BaseNewsItem extends Element {
	constructor(idOrSettings?: string | $BaseNewsItemSettings);
	constructor(id?: string, settings?: $BaseNewsItemSettings);
	/**
	 * Constructor for a new Base News Item.
	 *
	 * @param {string} [id] ID for the new base news item, generated automatically if an ID is not provided
	 * @param {object} [settings] Initial settings for the new base news item
	 */
	public constructor(id?: string, settings?: $BaseNewsItemSettings) {
		super(id, settings);
	}
	protected _oTile!: GenericTile;
	protected _i18nBundle!: ResourceBundle;

	static readonly metadata: MetadataOptions = {
		library: "sap.cux.home",
		properties: {
			/**
			 * The image URL of the news.
			 */
			imageUrl: { type: "string", group: "Misc" },
			/**
			 * Title of the news
			 */
			title: { type: "string", group: "Misc" },
			/**
			 * Subtitle of the app
			 */
			subTitle: { type: "string", group: "Misc" },
			/**
			 * Footer of the app
			 */
			footer: { type: "string", group: "Misc" },
			/**
			 * The priority of the news item.
			 */
			priority: { type: "sap.m.Priority", group: "Misc" },
			/**
			 * The priority text of the news item
			 */
			priorityText: { type: "string", group: "Misc" }
		}
	};

	/**
	 * Init lifecycle method
	 *
	 * @private
	 * @override
	 */
	public init(): void {
		super.init();
		this._i18nBundle = Lib.getResourceBundleFor("sap.cux.home.i18n") as ResourceBundle;
		if (!this._oTile) {
			this.createTile();
		}
	}

	/**
	 * Sets the image URL for the news item.
	 * @param {string} sUrl - The URL of the image.
	 */
	public setImageUrl(sUrl: string): BaseNewsItem {
		const imageUrl = sUrl;
		this._oTile.setBackgroundImage(imageUrl);
		return this.setProperty("imageUrl", imageUrl, true);
	}

	/**
	 * Sets the subTitle of the news item.
	 * @param {string} sText - The subTitle of the news item.
	 */
	public setSubTitle(sText: string): BaseNewsItem {
		(this._oTile.getTileContent()[0].getContent() as NewsContent).setSubheader(sText);
		return this.setProperty("subTitle", sText, true);
	}

	/**
	 * Sets the title of the news item.
	 * @param {string} sText - The Title of the news item.
	 */
	public setTitle(sText: string): BaseNewsItem {
		(this._oTile.getTileContent()[0].getContent() as NewsContent).setContentText(sText);
		return this.setProperty("title", sText, true);
	}

	/**
	 * Sets the footer of the news item.
	 * @param {string} sText - The footer of the news item.
	 */
	public setFooter(sText: string): BaseNewsItem {
		this._oTile.getTileContent()[0].setFooter(sText);
		return this.setProperty("footer", sText, true);
	}

	/**
	 * Sets the priority of the news item.
	 * @param {Priority} priority - The priority of the news item.
	 */
	public setPriority(priority: Priority): BaseNewsItem {
		this._oTile.getTileContent()[0].setPriority(priority);
		return this.setProperty("priority", priority, true);
	}

	/**
	 * Sets the priority text of the news item.
	 * @param {string} priorityText - The priority text of the news item.
	 */
	public setPriorityText(priorityText: string): BaseNewsItem {
		this._oTile.getTileContent()[0].setPriorityText(priorityText);
		return this.setProperty("priorityText", priorityText, true);
	}

	/**
	 * Retrieves the tile control associated with the news item.
	 * If the tile control does not exist, it is created.
	 * @returns {sap.m.Tile} The tile control.
	 */
	public getTile(): GenericTile {
		if (!this._oTile) {
			this.createTile();
		}
		return this._oTile;
	}

	/**
	 * Creates the tile control associated with the news item.
	 * @private
	 */
	public createTile(): void {
		this._oTile = new GenericTile(recycleId(`${this.getId()}-news-tile`), {
			mode: "ArticleMode",
			frameType: "Stretch" as FrameType,
			backgroundImage: this.getImageUrl(),
			tileContent: [
				new TileContent(recycleId(`${this.getId()}-news-tile-content`), {
					footer: this.getFooter(),
					priority: this.getPriority() || Priority.None,
					priorityText: this.getPriorityText(),
					content: new NewsContent(recycleId(`${this.getId()}-news-content`), {
						contentText: this.getTitle(),
						subheader: this.getSubTitle()
					})
				})
			]
		});
	}
}
