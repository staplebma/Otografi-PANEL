import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/auth';

interface PendingApprovalProps {
  email: string;
  userId: string;
}

export default function PendingApproval({ email, userId }: PendingApprovalProps) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');

  useEffect(() => {
    // Check approval status every 5 seconds
    const interval = setInterval(async () => {
      setChecking(true);
      try {
        // Try to login to check if account is active
        const result = await authService.checkUserStatus(userId);

        if (result.isActive) {
          setStatus('approved');
          // Auto-refresh after 2 seconds
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
        }
      } catch (error) {
        // Still pending or rejected
        console.log('Still waiting for approval...');
      } finally {
        setChecking(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [userId, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-4">
              {status === 'pending' && (
                <ClockIcon className="h-10 w-10 text-yellow-600 animate-pulse" />
              )}
              {status === 'approved' && (
                <CheckCircleIcon className="h-10 w-10 text-green-600" />
              )}
              {status === 'rejected' && (
                <XCircleIcon className="h-10 w-10 text-red-600" />
              )}
            </div>

            <h2 className="text-3xl font-extrabold text-gray-900">
              {status === 'pending' && 'Üyeliğiniz Onay Bekliyor'}
              {status === 'approved' && 'Hesabınız Onaylandı!'}
              {status === 'rejected' && 'Hesabınız Reddedildi'}
            </h2>

            <p className="mt-3 text-sm text-gray-600">
              {status === 'pending' && (
                <>
                  Kayıt işleminiz başarıyla tamamlandı.
                  <br />
                  <span className="font-semibold text-gray-700">{email}</span>
                  <br />
                  Hesabınızın yönetici tarafından onaylanması bekleniyor.
                </>
              )}
              {status === 'approved' && (
                <>
                  Tebrikler! Hesabınız aktif edildi.
                  <br />
                  Giriş sayfasına yönlendiriliyorsunuz...
                </>
              )}
              {status === 'rejected' && (
                <>
                  Maalesef hesabınız onaylanmadı.
                  <br />
                  Daha fazla bilgi için lütfen yönetici ile iletişime geçin.
                </>
              )}
            </p>
          </div>

          {/* Status Info */}
          {status === 'pending' && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Bekleme Süreci
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 space-y-1">
                    <p>• Hesabınız otomatik olarak kontrol ediliyor {checking && '🔄'}</p>
                    <p>• Onaylandığında otomatik olarak yönlendirileceksiniz</p>
                    <p>• Bu sayfayı kapatabilirsiniz, daha sonra giriş yapabilirsiniz</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {status === 'approved' && (
            <div className="bg-green-50 border-l-4 border-green-400 p-4">
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-400" />
                <p className="ml-3 text-sm font-medium text-green-800">
                  Hesabınız başarıyla aktif edildi. Giriş yapabilirsiniz.
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => navigate('/login')}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Giriş Sayfasına Dön
            </button>

            <button
              onClick={() => navigate('/')}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Ana Sayfaya Dön
            </button>
          </div>

          {/* Auto-check indicator */}
          {status === 'pending' && (
            <div className="text-center">
              <div className="inline-flex items-center text-xs text-gray-500">
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600 mr-2"></div>
                Otomatik kontrol ediliyor...
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            Sorun mu yaşıyorsunuz?{' '}
            <button
              onClick={() => navigate('/support')}
              className="font-medium text-white hover:text-white/90 underline"
            >
              Destek alın
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
