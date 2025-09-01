import emailjs from '@emailjs/browser';

export const sendEmail = async ({ email, subject, message, sendCopy ,userLogin }) => {
  try {
    // Wysyłanie głównej wiadomości do administracji
    const adminEmailResponse = await emailjs.send(
      'service_9jfz1cg',
      'template_4al197e',
      {
        from_email: email,
        from_name: userLogin,
        subject: subject,
        message: message,
      },
      'jUVTRuRTD29YaFldw'
    );

    // Jeśli użytkownik chce otrzymać kopię
    if (sendCopy) {
      await emailjs.send(
        'service_9jfz1cg',
        'template_2r1lbbf',
        {
          to_email: email,
          subject: subject,
          message: message,
        },
        'jUVTRuRTD29YaFldw'
      );
    }

    return adminEmailResponse;
  } catch (error) {
    console.error('Błąd podczas wysyłania emaila:', error);
    throw new Error('Nie udało się wysłać wiadomości');
  }
};