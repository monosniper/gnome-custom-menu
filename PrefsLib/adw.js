import Adw from 'gi://Adw';
import GObject from 'gi://GObject';
import Gtk from 'gi://Gtk';

export const CustomMenuSettingsPage = GObject.registerClass(class CustomMenuSettingsWidget extends Adw.PreferencesPage {
    _init(settings, window) {
	super._init();
	this._settings = settings;
	this._window = window;
	this.set_title('Main');
	this.set_name('Main');
	this.set_icon_name('emblem-system-symbolic');
	
	const sshGroup = new Adw.PreferencesGroup({
	    title: 'SSH',
	});
	
	const projectsGroup = new Adw.PreferencesGroup({
	    title: 'Projects',
	});
	
	const projectsDirectory = new Adw.ActionRow({
	    title: 'Directory'
	})
	
	const currentProjectsDirectory = this._settings.get_string('custommenu-projects-directory')
	const changeProjectsDirectoryInput = new Gtk.Entry({
	    valign: Gtk.Align.CENTER,
	})
	
	changeProjectsDirectoryInput.set_text(currentProjectsDirectory)
	changeProjectsDirectoryInput.connect('changed', () => {
	    this._settings.set_string('custommenu-projects-directory', changeProjectsDirectoryInput.get_text());
	});
	
	projectsDirectory.add_suffix(changeProjectsDirectoryInput)
	
	projectsGroup.add(projectsDirectory);
	
	// Получаем существующие соединения
	let connections = settings.get_strv('ssh');
	let fieldsArray = [];
	
	// Кнопка для сохранения настроек (по умолчанию скрыта)
	let saveButton = new Gtk.Button({ label: 'Save' });
	saveButton.set_visible(false); // Скрываем кнопку по умолчанию
	
	// Кнопка для отмены добавления нового соединения (по умолчанию скрыта)
	let cancelButton = new Gtk.Button({ label: 'Cancel' });
	cancelButton.set_visible(false); // Скрыта по умолчанию
	
	// Функция для создания полей для одного соединения
	function createConnectionFields(connection) {
	    // Горизонтальный контейнер для полей
	    let connectionBox = new Gtk.Box({
		orientation: Gtk.Orientation.HORIZONTAL,
		spacing: 6,
		margin_top: 10,
		margin_bottom: 10,
	    });
	    
	    // Поле Host
	    let hostEntry = new Gtk.Entry({ placeholder_text: 'Host' });
	    if (connection) {
		let connData = JSON.parse(connection);
		hostEntry.set_text(connData.host || '');
	    }
	    connectionBox.append(hostEntry); // Добавляем в контейнер
	    
	    // Поле Port
	    let portEntry = new Gtk.Entry({ placeholder_text: 'Port' });
	    if (connection) {
		let connData = JSON.parse(connection);
		portEntry.set_text(connData.port || '');
	    }
	    connectionBox.append(portEntry); // Добавляем в контейнер
	    
	    // Поле User
	    let userEntry = new Gtk.Entry({ placeholder_text: 'User' });
	    if (connection) {
		let connData = JSON.parse(connection);
		userEntry.set_text(connData.user || '');
	    }
	    connectionBox.append(userEntry); // Добавляем в контейнер
	    
	    // Поле Password
	    let passwordEntry = new Gtk.Entry({ placeholder_text: 'Password' });
	    if (connection) {
		let connData = JSON.parse(connection);
		passwordEntry.set_text(connData.password || '');
	    }
	    connectionBox.append(passwordEntry); // Добавляем в контейнер
	    
	    // Добавляем контейнер с полями в группу
	    sshGroup.add(connectionBox);
	    
	    // Сохраняем виджеты для дальнейшего использования
	    fieldsArray.push({ hostEntry, portEntry, userEntry, passwordEntry });
	    
	    // Контейнер для кнопок Save и Cancel
	    let buttonBox = new Gtk.Box({
		orientation: Gtk.Orientation.HORIZONTAL,
		spacing: 10, // Расстояние между кнопками
		halign: Gtk.Align.END // Выровнять по правому краю
	    });
	    
	    // Добавляем кнопки в контейнер
	    buttonBox.append(cancelButton);
	    buttonBox.append(saveButton);
	    
	    // Добавляем контейнер с кнопками под форму
	    sshGroup.add(buttonBox);
	    
	    // Показываем кнопки
	    saveButton.set_visible(true);
	    cancelButton.set_visible(true);
	}
	
	// Добавляем существующие соединения в группу
	connections.forEach((connection) => {
	    createConnectionFields(connection);
	});
	
	// Кнопка для добавления нового соединения
	let addButton = new Gtk.Button({ label: 'Add connection' });
	addButton.connect('clicked', () => {
	    createConnectionFields(); // Создаём новый набор полей
	    this._window.show_all();
	});
	sshGroup.add(addButton); // Добавляем кнопку в группу
	
	// Обработка кнопки Save
	saveButton.connect('clicked', () => {
	    let newConnections = fieldsArray.map(fields => {
		return JSON.stringify({
		    host: fields.hostEntry.get_text(),
		    port: fields.portEntry.get_text(),
		    user: fields.userEntry.get_text(),
		    password: fields.passwordEntry.get_text()
		});
	    });
	    
	    // Сохраняем все соединения в GSettings
	    settings.set_strv('ssh', newConnections);
	    
	    // Скрываем кнопки после сохранения
	    saveButton.set_visible(false);
	    cancelButton.set_visible(false);
	});
	
	// Обработка кнопки Cancel
	cancelButton.connect('clicked', () => {
	    // Удаляем последний набор полей (последнее созданное соединение)
	    let lastFieldSet = fieldsArray.pop();
	    sshGroup.remove(lastFieldSet.hostRow);
	    sshGroup.remove(lastFieldSet.portRow);
	    sshGroup.remove(lastFieldSet.userRow);
	    sshGroup.remove(lastFieldSet.passwordRow);
	    
	    // Скрываем кнопки Save и Cancel, если отменено добавление
	    saveButton.set_visible(false);
	    cancelButton.set_visible(false);
	    
	    this._window.show_all(); // Обновляем интерфейс
	});
	
	this.add(sshGroup);
	this.add(projectsGroup);
    }
});

// export const CustomMenuOptionsPage {
//
// }
