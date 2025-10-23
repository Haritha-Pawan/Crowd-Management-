import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../User/User.model.js';
import Ticket from '../Register/Model/ticket.model.js';
import nodemailer from 'nodemailer';

export const login = async (req, res) => {   // <--- added export here
  try {
    const { email, password } = req.body;

    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const rawPassword = typeof password === 'string' ? password : '';

    if (!normalizedEmail || !rawPassword) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // find the user (staff/admin/etc.) or fallback to attendee ticket
    let account = await User.findOne({ email: normalizedEmail });
    let isAttendee = false;

    if (!account) {
      account = await Ticket.findOne({ email: normalizedEmail });
      isAttendee = Boolean(account);
    }

    if (!account) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    // compare password
    const isMatch = await bcrypt.compare(rawPassword, account.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const role = account.role || (isAttendee ? 'Attendee' : undefined);
    const username = account.username || account.name || account.fullName || account.email;

    // create JWT token
    const token = jwt.sign(

      { id: user._id, role: user.role,username: user.name, email: user.email },

      { id: account._id, role, username, email: account.email },

      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: account._id,
        email: account.email,
        role,
        username,
        ...(isAttendee
          ? {
              fullName: account.fullName,
              ticketType: account.type,
            }
          : {}),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export const fogetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // create token (expires in 15 minutes)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

    // send email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: user.email,
      subject: 'Password Reset',
      html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 15 minutes.</p>`
    });

    res.json({ message: 'Reset link sent to email' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  try {
    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.findByIdAndUpdate(decoded.id, { password: hashedPassword });

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: 'Invalid or expired token' });
  }
}

//create forget password
