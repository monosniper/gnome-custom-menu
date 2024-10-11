import Gio from 'gi://Gio';
import GLib from 'gi://GLib';
import GObject from 'gi://GObject';
import St from 'gi://St';

import {Extension} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';
import * as Util from 'resource:///org/gnome/shell/misc/util.js';

const MenuItem = GObject.registerClass(
    class CustomMenuItem extends PopupMenu.PopupMenuItem {
        _init(name, activateFunction, icon_name=null, extension=null) {
            super._init(name);
            this.connect('activate', () => activateFunction());
            
            if(icon_name) {
                let iconPath = extension.path + `/icons/${icon_name}.svg`;
                let gicon = Gio.icon_new_for_string(iconPath);
                let icon = new St.Icon({
                    gicon: gicon,
                    icon_size: 20,
                });
                this.insert_child_at_index(icon, 0);
            }
        }
    }
);

const MenuButton = GObject.registerClass(
    class CustomMenuButton extends PanelMenu.Button {
        _init(extension) {
            super._init(0.5, extension.metadata.name);
            this._extension = extension;
            this._settings = extension.getSettings();
            
            this.icon = new St.Icon({
                icon_name: 'heart',
                style_class: 'menu-button',
                icon_size: 20,
            });
            
            this.add_child(this.icon);
            this._displayMenuItems();
        }
        
        _commandItem(label, command, icon_name) {
            return new MenuItem(
                label,
                () => this._runCommand(command),
                icon_name,
                this._extension
            )
        }
        
        _addItem(item) {
            this.menu.addMenuItem(item)
        }
        
        _displayMenuItems() {
            this.menu.removeAll();
            
            const sshMenu = new PopupMenu.PopupSubMenuMenuItem('SSH')
            
            const mialineSsh = new PopupMenu.PopupMenuItem('Mialine');
            mialineSsh.connect('activate', () => Util.trySpawnCommandLine('gnome-terminal -- sshpass -p "%y1qiafx" ssh user@mialine.uz -p 30120'));
            
            sshMenu.menu.addMenuItem(mialineSsh)
            
            this._addItem(sshMenu);
            
            this._addItem(new PopupMenu.PopupSeparatorMenuItem());
            this._addItem(this._commandItem(
                'Restart Nginx',
                'systemctl restart nginx',
                'nginx'
            ));
        }
        
        _runCommand(command) {
            try {
                GLib.spawn_command_line_async('sudo ' + command);
                Main.notify("Success", command);
            } catch (error) {
                logError(error, "Ошибка при выполнении команды");
                Main.notify("Error", `Cant run this command (${command})`);
            }
        }
    }
)

export default class CustomMenu extends Extension {
    enable() {
        this.settings = this.getSettings();
        
        const indicator = new MenuButton(this);
        Main.panel.addToStatusArea(this.metadata.name, indicator, 0, 'left');
    }

    disable() {
        Main.panel.statusArea[this.metadata.name].destroy();
    }
}
