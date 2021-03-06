const mongoose = require('mongoose');
const express = require('express');
const router = express.Router();
const moment = require('moment');
const axios = require('axios');
const fs = require('fs');
const formidable = require('formidable');

const ChatroomModel = require('../models/Chatroom.js');
const DMModel = require('../models/DM.js');
const UserModel = require('../models/User.js');

// New chatroom
router.post('/chatroom/new', (req, res) => {
	let id = '';
	const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	let charactersLength = characters.length;
	for (let i = 0; i < 8; i++) {
		id += characters.charAt(Math.floor(Math.random() * charactersLength));
	}

	ChatroomModel.create({
		_id: mongoose.Types.ObjectId(),
		icon: req.body.icon,
		id,
		name: req.body.name,
		owner: req.body.owner,
		owner_id: req.body.owner_id,
		theme: req.body.theme,
		messages: []
	}).then((data) => {
		ChatroomModel.findOne({ id: data.id }, async (error, data) => {
			if (!error) {
				var User = await UserModel.findOne({ _id: req.body.owner });
				User.chatrooms.push({
					name: data.name,
					id: data.id,
					icon: data.icon,
					status: 'approved'
				});
				data.people.approved.push({
					_id: User._id,
					username: User.username,
					color: User.color
				});
				await User.save();
				await fs.mkdirSync(__dirname + `/../files/wire/chatroom/${data.id}`);
				console.log(
					'\x1b[32m',
					'[  WIRE  ]',
					'\x1b[31m',
					moment().format('MM/DD/YYYY, HH:MM:SS'),
					'\x1b[33m',
					req.connection.remoteAddress,
					'\x1b[0m',
					'chatroom with id',
					'\x1b[34m',
					data.id,
					'\x1b[0m',
					'and name',
					'\x1b[34m',
					data.title,
					'\x1b[0m',
					'was created'
				);
				res.json(data);
			}
		});
	});
});

// Send file
router.post('/chatroom/:id/file', async (req, res) => {
	var Chatroom = await ChatroomModel.findOne({ id: req.params.id });
	var file;

	const form = formidable({
		multiples: false,
		uploadDir: __dirname + '/../files/wire/chatroom/' + Chatroom.id,
		keepExtensions: true
	});

	await form.parse(req, async (error, fields, files) => {
		if (error) console.error(error);

		file = files.file;
		await fs.renameSync(file.path, __dirname + '/../files/wire/chatroom/' + Chatroom.id + '/' + file.name);
		res.end();
	});
});

// Send file
router.post('/dm/:id/file', async (req, res) => {
	var DM_data = await DMModel.findOne({ _id: req.params.id });
	var file;

	const form = formidable({
		multiples: false,
		uploadDir: __dirname + '/../files/wire/dm/' + DM_data._id,
		keepExtensions: true
	});

	await form.parse(req, async (error, fields, files) => {
		if (error) console.error(error);

		file = files.file;
		await fs.renameSync(file.path, __dirname + '/../files/wire/dm/' + DM_data._id + '/' + file.name);
		res.end();
	});
});

// Deletes a chatroom
router.get('/chatroom/:id/delete', async (req, res) => {
	var Chatroom = await ChatroomModel.findOne({ id: req.params.id });
	await ChatroomModel.findOneAndDelete({ id: req.params.id });
	async function deleteFolderRecursive(path) {
		fs.readdir(path, async (error, files) => {
			if (error) console.error(error);
			else {
				await files.forEach(async (file) => {
					var curPath = path + '/' + file;
					await fs.lstat(curPath, async (error, stats) => {
						if (stats.isDirectory()) {
							deleteFolderRecursive(curPath);
						} else {
							await fs.unlink(curPath, () => {});
						}
					});
				});
			}
			fs.rmdir(path, async (error) => {
				console.log(
					'\x1b[32m',
					'[  WIRE  ]',
					'\x1b[31m',
					moment().format('MM/DD/YYYY, HH:MM:SS'),
					'\x1b[33m',
					req.connection.remoteAddress,
					'\x1b[0m',
					'chatroom with id',
					'\x1b[34m',
					req.params.id,
					'\x1b[0m',
					'was deleted'
				);
				res.end();
			});
		});
	}
	deleteFolderRecursive(__dirname + '/../files/wire/' + Chatroom._id);
});

router.get('/chatroom/:id/remove/:user', async (req, res) => {
	var User = await UserModel.findOne({ _id: req.params.user });
	var Chatroom = await ChatroomModel.findOne({ id: req.params.id });

	var User_I = await Chatroom.people.approved.findIndex((person) => {
		return person._id == req.params.user;
	});
	var Profile_I = await User.chatrooms.findIndex((chatroom) => {
		return chatroom.id == req.params.id;
	});

	await Chatroom.people.approved[User_I].remove();
	await User.chatrooms[Profile_I].remove();

	await User.save();
	await Chatroom.save();

	res.json(User);
});

router.get('/chatroom/:id/request/:user/approve', async (req, res) => {
	var User = await UserModel.findOne({ _id: req.params.user });
	var Chatroom = await ChatroomModel.findOne({ id: req.params.id });

	var User_I = await Chatroom.people.requested.findIndex((person) => {
		return person._id == req.params.user;
	});
	var Profile_I = await User.chatrooms.findIndex((chatroom) => {
		return chatroom.id == req.params.id;
	});

	await Chatroom.people.requested[User_I].remove();

	var chatroom_data = User.chatrooms[Profile_I];
	await User.chatrooms.splice(Profile_I, 1, {
		name: chatroom_data.name,
		id: chatroom_data.id,
		icon: chatroom_data.icon,
		status: 'approved'
	});

	await Chatroom.people.approved.push({
		_id: User._id,
		username: User.username,
		color: User.color
	});

	await User.save();
	await Chatroom.save();

	res.json(User);
});

router.get('/chatroom/:id/request/:user/reject', async (req, res) => {
	var User = await UserModel.findOne({ _id: req.params.user });
	var Chatroom = await ChatroomModel.findOne({ id: req.params.id });

	var User_I = await Chatroom.people.requested.findIndex((person) => {
		return person._id == req.params.user;
	});
	var Profile_I = await User.chatrooms.findIndex((chatroom) => {
		return chatroom.id == req.params.id;
	});

	await Chatroom.people.requested[User_I].remove();
	await User.chatrooms[Profile_I].remove();

	await User.save();
	await Chatroom.save();

	res.json(User);
});

router.get('/chatroom/:id/ban/:user', async (req, res) => {
	var User = await UserModel.findOne({ username: req.params.user });
	var Chatroom = await ChatroomModel.findOne({ id: req.params.id });

	var Requested_I = await Chatroom.people.requested.findIndex((person) => {
		return person.username == req.params.user;
	});
	var Approved_I = await Chatroom.people.approved.findIndex((person) => {
		return person.username == req.params.user;
	});

	if (Requested_I >= 0)
		await axios.get(`https://www.theparadigm.ga/api/wire/chatroom/${req.params.id}/request/${User._id}/reject`);
	if (Approved_I >= 0)
		await axios.get(`https://www.theparadigm.ga/api/wire/chatroom/${req.params.id}/remove/${User._id}`);

	await Chatroom.people.banned.push({
		_id: User._id,
		username: User.username,
		color: User.color
	});

	await Chatroom.save();

	res.json(User);
});

router.get('/chatroom/:id/unban/:user', async (req, res) => {
	var User = await UserModel.findOne({ _id: req.params.user });
	var Chatroom = await ChatroomModel.findOne({ id: req.params.id });

	var User_I = await Chatroom.people.banned.findIndex((person) => {
		return person._id == req.params.user;
	});

	await Chatroom.people.banned[User_I].remove();
	await Chatroom.save();

	res.json(User);
});

router.get('/chatroom/:id/purge', async (req, res) => {
	var Chatroom = await ChatroomModel.findOne({ id: req.params.id });
	Chatroom.messages = [];
	await Chatroom.save();
	console.log(
		'\x1b[32m',
		'[  WIRE  ]',
		'\x1b[31m',
		moment().format('MM/DD/YYYY, HH:MM:SS'),
		'\x1b[33m',
		req.connection.remoteAddress,
		'\x1b[0m',
		'chatroom with id',
		'\x1b[34m',
		Chatroom.id,
		'\x1b[0m',
		'was purged'
	);
	res.end();
});

module.exports = router;
