import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import api from '../services/api';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Şifre sıfırlama bağlantısı e-posta adresinize gönderildi');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-center mb-8">
            <img
              src="/logo.png"
              alt="Otografi"
              className="h-24 w-auto object-contain"
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.classList.remove('hidden');
              }}
            />
            <div className="w-20 h-20 bg-primary rounded-full hidden items-center justify-center">
              <span className="text-white text-3xl font-bold">OT</span>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h1>
            <p className="text-gray-600">
              {sent
                ? 'E-posta gönderildi!'
                : 'E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim'}
            </p>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-800 text-sm">
                  Şifre sıfırlama bağlantısı <strong>{email}</strong> adresine gönderildi.
                  Lütfen e-postanızı kontrol edin.
                </p>
              </div>

              <div className="text-sm text-gray-600">
                <p>E-posta gelmedi mi?</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Spam klasörünüzü kontrol edin</li>
                  <li>E-posta adresinizin doğru olduğundan emin olun</li>
                  <li>Birkaç dakika bekleyin ve tekrar deneyin</li>
                </ul>
              </div>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full btn-secondary"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Giriş Sayfasına Dön
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  E-posta Adresi
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-field pl-10"
                    placeholder="ornek@email.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
              </button>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full btn-secondary"
              >
                <ArrowLeftIcon className="h-5 w-5" />
                Giriş Sayfasına Dön
              </Link>
            </form>
          )}
        </div>

        <p className="text-center mt-6 text-sm text-gray-600">
          © 2025 Otografi. Tüm hakları saklıdır.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
