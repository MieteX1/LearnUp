import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {sendEmail} from "../services/emailService.js";
import { useAlert } from '../components/ui/Alert';
import emailjs from '@emailjs/browser';

const ContactPage = () => {
  const { user } = useAuth();
  const { addAlert } = useAlert();
  const [formData, setFormData] = useState({
    email: '',
    subject: '',
    message: '',
    consent: false,
    sendCopy: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    emailjs.init("jUVTRuRTD29YaFldw");

    if (user?.email) {
      setFormData(prev => ({ ...prev, email: user.email }));
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.consent) {
      addAlert('Musisz wyrazić zgodę na korespondencję, aby wysłać wiadomość.', 'warning');
      return;
    }

    setIsSubmitting(true);

    try {
      await sendEmail({
        ...formData,
        userLogin: user?.login || 'Gość'
      });
      addAlert('Wiadomość została wysłana pomyślnie!', 'success');
      setFormData({
        email: user?.email || '',
        subject: '',
        message: '',
        consent: false,
        sendCopy: false,
      });
    } catch (error) {
      addAlert('Błąd podczas wysyłania wiadomości. Spróbuj ponownie później.', 'error');
      console.error('Error sending email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-start">
      <h1 className="text-4xl md:text-5xl mt-16 md:mt-20 mb-6">
        Kontakt
      </h1>

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md md:max-w-lg mt-16 md:mt-20 px-4 md:px-0 space-y-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-base md:text-lg font-medium"
          >
            E-mail*
          </label>
          <input
            type="email"
            id="email"
            placeholder="Wpisz swój adres e-mail"
            value={formData.email}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="subject"
            className="block text-base md:text-lg font-medium"
          >
            Temat
          </label>
          <input
            type="text"
            id="subject"
            placeholder="Wpisz temat wiadomości"
            value={formData.subject}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            className="w-full px-4 py-3 rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-950"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="message"
            className="block text-base md:text-lg font-medium"
          >
            Wiadomość*
          </label>
          <textarea
            id="message"
            placeholder="Napisz treść wiadomości"
            value={formData.message}
            onChange={handleInputChange}
            required
            disabled={isSubmitting}
            rows={6}
            className="w-full px-4 py-3 rounded-3xl bg-[#F5F5F5] border-2 border-[#D9D9D9] shadow-lg focus:outline-none focus:ring-2 focus:ring-neutral-950 resize-none"
          />
        </div>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="consent"
              checked={formData.consent}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-4 h-4 ml-4"
            />
            <label htmlFor="consent" className="text-xs md:text-sm text-[#555555]">
              Wyrażam zgodę na otrzymywanie korespondencji na podany e-mail*
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="sendCopy"
              checked={formData.sendCopy}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-4 h-4 ml-4"
            />
            <label htmlFor="sendCopy" className="text-xs md:text-sm text-[#555555]">
              Wyślij mi kopię tej wiadomości na mój adres email
            </label>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-12 py-3 text-lg md:text-xl bg-[#69DC9E] text-gray-900 rounded-3xl 
              ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#5bc78d]'} 
              transition-colors shadow-md`}
          >
            {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactPage;