import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnvelopeIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

const ForgotPassword: React.FC = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await authService.forgotPassword(email);
            setSubmitted(true);
            toast.success('Sıfırlama bağlantısı gönderildi');
        } catch (error) {
            toast.error('Bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <Link to="/login" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6">
                        <ArrowLeftIcon className="h-4 w-4 mr-1" />
                        Giriş sayfasına dön
                    </Link>

                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Şifremi Unuttum</h1>
                        <p className="text-gray-600">
                            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
                        </p>
                    </div>

                    {submitted ? (
                        <div className="text-center bg-green-50 p-6 rounded-lg">
                            <EnvelopeIcon className="h-12 w-12 text-green-500 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">E-posta Gönderildi</h3>
                            <p className="text-sm text-gray-600 mb-6">
                                Lütfen e-posta kutunuzu kontrol edin. Şifre sıfırlama talimatlarını içeren bir e-posta gönderdik.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="text-primary hover:text-primary-600 text-sm font-medium"
                            >
                                Farklı bir e-posta adresi dene
                            </button>
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
                                className="w-full btn-primary"
                            >
                                {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
