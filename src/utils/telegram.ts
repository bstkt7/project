import { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } from '../config';
import { supabase } from './supabase';

export async function sendToTelegram(title: string, description: string) {
  const message = `🎫 Новый тикет:\n\n📝 Тема: ${title}\n\n📄 Описание:\n${description}`;
  
  try {
    // First, save to Supabase
    const { error: dbError } = await supabase
      .from('tickets')
      .insert([{ title, description }]);

    if (dbError) {
      console.error('Error saving to database:', dbError);
      return false;
    }

    // Then send to Telegram
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to send message to Telegram');
    }

    return true;
  } catch (error) {
    console.error('Error sending to Telegram:', error);
    return false;
  }
}