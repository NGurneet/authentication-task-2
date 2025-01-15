// import express, { Request, Response } from 'express';
// import { sendEmail } from './mailer';

// const router = express.Router();

// router.post('/send-email', async (req: Request, res: Response) => {
//   const { to, subject, text, html } = req.body;

//   try {
//     const info = await sendEmail(to, subject, text, html);
//     res.status(200).json({ message: 'Email sent successfully', info });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to send email' });
//   }
// });

// export default router;
