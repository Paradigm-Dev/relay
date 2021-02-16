const { Router } = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UserModel = require('../models/User');
const { jwt_secret } = require('../config/vapid');
const moment = require('moment');
const fs = require('fs');

const router = Router();

const maxAge = 7 * 24 * 60 * 60;
function createToken(id) {
	return jwt.sign({ id }, jwt_secret, {
		expiresIn: maxAge
	});
}

function handleErrors(err) {
	let errors = { username: '', password: '' };

	// incorrect username
	if (err.message === 'incorrect username') {
		errors.username = 'Username is not registered';
	}

	// incorrect password
	if (err.message === 'incorrect password') {
		errors.password = 'Password is incorrect';
	}

	// duplicate username error
	if (err.code === 11000) {
		errors.username = 'Username is already registered';
		return errors;
	}

	// validation errors
	if (err.message.includes('user validation failed')) {
		Object.values(err.errors).forEach(({ properties }) => {
			errors[properties.path] = properties.message;
		});
	}

	return errors;
}

async function signIn(username, password) {
	const user = await UserModel.findOneAndUpdate({ username }, { in: true }, { new: true });
	if (user) {
		const auth = await bcrypt.compare(password, user.password);
		if (auth) {
			return user;
		}
		throw Error('incorrect password');
	}
	throw Error('incorrect username');
}

router.post('/signin', async (req, res) => {
	const { username, password, sticky } = req.body;

	try {
		const user = await signIn(username, password);
		const token = createToken(user._id);
		if (sticky) {
			res.cookie('jwt', token, {
				maxAge: maxAge * 1000
			});
		} else {
			res.cookie('jwt', token);
		}
		res.status(200).json({ user, jwt: token });
	} catch (err) {
		const errors = handleErrors(err);
		res.json({ errors });
	}
});

router.post('/signup', async (req, res) => {
	try {
		const salt = await bcrypt.genSalt();
		const password = await bcrypt.hash(req.body.password, salt);

		const user = await UserModel.create({
			username: req.body.username,
			password,
			bio: req.body.bio,
			color: req.body.color,
			rights: req.body.rights,
			code: req.body.code,
			chatrooms: [],
			people: {
				requests: [],
				approved: [],
				blocked: [],
				sent: [],
				blocked_by: []
			},
			banned: false,
			strikes: 0,
			posts: [],
			pinned_apps: req.body.pinned_apps,
			preflight: false,
			notifications: [],
			in: true
		});

		// await ApolloModel.findOneAndUpdate(
		//   { code: req.body.code },
		//   { $set: { used: true, username: user.username, uid: user._id } }
		// );

		fs.mkdirSync('/mnt/drawer/' + user._id);
		fs.mkdirSync(__dirname + '/../files/broadcast/' + user._id);

		const token = createToken(user._id);
		res.cookie('jwt', token, {
			httpOnly: false
			// maxAge: maxAge * 1000,
		});

		console.log(
			'\x1b[32m',
			'[  AUTH  ]',
			'\x1b[31m',
			moment().format('MM/DD/YYYY, HH:MM:SS'),
			'\x1b[33m',
			req.connection.remoteAddress,
			'\x1b[34m',
			user.username,
			'\x1b[0m',
			'signed up'
		);

		res.json(user);
	} catch (err) {
		console.error(err);
		const errors = handleErrors(err);
		res.json({ errors });
	}
});

router.get('/signout', (req, res) => {
	res.cookie('jwt', '', { maxAge: 1 });
	res.redirect('/');
});

router.get('/verify', async (req, res) => {
	const token = req.cookies.jwt;
	if (token) {
		jwt.verify(token, jwt_secret, async (err, decodedToken) => {
			if (err) {
				res.cookie('jwt', '', { maxAge: 1 });
				res.sendStatus(403);
			} else {
				const user = await UserModel.findById(decodedToken.id);
				if (user) {
					console.log(
						'\x1b[32m',
						'[  AUTH  ]',
						'\x1b[31m',
						moment().format('MM/DD/YYYY, HH:MM:SS'),
						'\x1b[33m',
						req.connection.remoteAddress,
						'\x1b[34m',
						user.username,
						'\x1b[0m',
						'token verified'
					);

					res.json({
						valid: true,
						user
					});
				}
			}
		});
	} else {
		res.json({ valid: false });
	}
});

router.post('/verify', async (req, res) => {
	const token = req.body.jwt;
	if (token) {
		jwt.verify(token, jwt_secret, async (err, decodedToken) => {
			if (err) {
				res.json({ valid: false });
			} else {
				const user = await UserModel.findById(decodedToken.id);
				console.log(
					'\x1b[32m',
					'[  AUTH  ]',
					'\x1b[31m',
					moment().format('MM/DD/YYYY, HH:MM:SS'),
					'\x1b[33m',
					req.connection.remoteAddress,
					'\x1b[34m',
					user.username,
					'\x1b[0m',
					'token verified'
				);

				if (user)
					res.json({
						valid: true,
						user
					});
			}
		});
	} else {
		res.json({ valid: false });
	}
});

// router.post("/regen", async (req, res) => {
//   const salt = await bcrypt.genSalt();
//   const password = await bcrypt.hash(req.body.password, salt);
//   res.json({ password });
// });

module.exports = router;
