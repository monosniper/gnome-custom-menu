import {CustomMenuSettingsPage} from './PrefsLib/adw.js';

import {ExtensionPreferences} from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class CustomMenuPrefs extends ExtensionPreferences {
    fillPreferencesWindow(window) {
	window.search_enabled = true;
	
	const settings =  this.getSettings();
	
	const iconSettingsPage = new CustomMenuSettingsPage(settings, window);
	window.add(iconSettingsPage);
	// const optionsPage = new CustomMenuOptionsPage(settings);
	// window.add(optionsPage);
    }
}