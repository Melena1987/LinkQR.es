import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { QRConfig } from '../../types';
import { Loader2, Trash2, Edit, Calendar, Link as LinkIcon, ExternalLink, QrCode, Download } from 'lucide-react';
import { clsx } from 'clsx';
import { DOMAIN } from '../../constants';
import qrcode from 'qrcode-generator';

interface DashboardProps {
  user: User;
  onEdit: (id: string, config: QRConfig) => void;
  onCreateNew: () => void;
}

interface SavedQR extends QRConfig {
  id: string;
  createdAt: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ user, onEdit, onCreateNew }) => {
  const [qrs, setQrs] = useState<SavedQR[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    fetchQRs();
  }, [user]);

  const fetchQRs = async () => {
    try {
      const q = query(
        collection(db, 'qrs'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const fetchedQrs: SavedQR[] = [];
      querySnapshot.forEach((doc) => {
        fetchedQrs.push({ id: doc.id, ...doc.data() } as SavedQR);
      });
      setQrs(fetchedQrs);
    } catch (error) {
      console.error("Error fetching QRs:", error);
      try {
        const q2 = query(collection(db, 'qrs'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q2);
        const fetchedQrs: SavedQR[] = [];
        querySnapshot.forEach((doc) => {
           fetchedQrs.push({ id: doc.id, ...doc.data() } as SavedQR);
        });
        fetchedQrs.sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
        setQrs(fetchedQrs);
      } catch (e) {
        console.error("Retry failed", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este QR? Esta acción no se puede deshacer.")) return;
    
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'qrs', id));
      setQrs(prev => prev.filter(q => q.id !== id));
    } catch (error) {
      console.error("Error deleting QR:", error);
      alert("Error al eliminar el QR");
    } finally {
      setDeletingId(null);
    }
  };

  const handleDownload = (qr: SavedQR) => {
    setDownloadingId(qr.id);
    
    setTimeout(() => {
        try {
            const qrValue = qr.qrType === 'dynamic' 
                ? `https://${DOMAIN}/${qr.shortUrlId}` 
                : qr.destinationUrl || 'https://linkqr.es';
            
            const typeNumber = 0;
            const errorCorrectionLevel = 'H';
            const qrGen = qrcode(typeNumber, errorCorrectionLevel);
            qrGen.addData(qrValue);
            qrGen.make();

            const baseSize = 1000;
            const moduleCount = qrGen.getModuleCount();
            const moduleSize = baseSize / moduleCount;

            const canvas = document.createElement('canvas');
            canvas.width = baseSize;
            canvas.height = baseSize;
            const ctx = canvas.getContext('2d');
            
            if (!ctx) return;

            // Background
            ctx.fillStyle = qr.bgColor || '#ffffff';
            ctx.fillRect(0, 0, baseSize, baseSize);

            // Foreground
            ctx.fillStyle = qr.fgColor || '#000000';
            
            for (let row = 0; row < moduleCount; row++) {
                for (let col = 0; col < moduleCount; col++) {
                    if (qrGen.isDark(row, col)) {
                        // Simple square drawing for download from dashboard
                        // (To retain full style fidelity, we'd need to duplicate logic from Preview.tsx or extract it)
                        const x = col * moduleSize;
                        const y = row * moduleSize;
                        // Use eye color for corners if specified, else fgColor
                        const isEye = (row < 7 && col < 7) || (row < 7 && col >= moduleCount - 7) || (row >= moduleCount - 7 && col < 7);
                        ctx.fillStyle = isEye ? (qr.eyeColor || qr.fgColor) : qr.fgColor;
                        ctx.fillRect(x, y, moduleSize + 0.5, moduleSize + 0.5); // +0.5 to avoid gaps
                    }
                }
            }

            // Draw Logo if exists
            if (qr.logoUrl) {
                const logoImg = new Image();
                logoImg.crossOrigin = "Anonymous";
                logoImg.src = qr.logoUrl;
                logoImg.onload = () => {
                    const logoSizeRatio = (qr.logoPadding || 35) / 150; 
                    const logoPixelSize = baseSize * logoSizeRatio;
                    const logoX = (baseSize - logoPixelSize) / 2;
                    const logoY = (baseSize - logoPixelSize) / 2;
                    ctx.drawImage(logoImg, logoX, logoY, logoPixelSize, logoPixelSize);
                    triggerDownload();
                };
                logoImg.onerror = () => triggerDownload(); // Download anyway if logo fails
            } else {
                triggerDownload();
            }

            function triggerDownload() {
                const link = document.createElement("a");
                link.download = `${qr.title || 'qrcode'}.png`;
                link.href = canvas.toDataURL("image/png");
                link.click();
                setDownloadingId(null);
            }

        } catch (e) {
            console.error("Download failed", e);
            alert("Error al generar la descarga.");
            setDownloadingId(null);
        }
    }, 100);
  };

  // Thumbnail Renderer Component
  const QRThumbnail = ({ config }: { config: SavedQR }) => {
    try {
        const qrValue = config.qrType === 'dynamic' 
            ? `https://${DOMAIN}/${config.shortUrlId}` 
            : config.destinationUrl || 'https://linkqr.es';
        
        const qr = qrcode(0, 'M'); // Lower error correction for thumbnail is fine/faster
        qr.addData(qrValue);
        qr.make();
        const count = qr.getModuleCount();
        
        return (
            <svg viewBox={`0 0 ${count} ${count}`} className="w-full h-full" style={{ backgroundColor: config.bgColor }}>
                <rect width="100%" height="100%" fill={config.bgColor} />
                {Array.from({ length: count }).map((_, r) => 
                    Array.from({ length: count }).map((_, c) => {
                        if (qr.isDark(r, c)) {
                             const isEye = (r < 7 && c < 7) || (r < 7 && c >= count - 7) || (r >= count - 7 && c < 7);
                             return (
                                <rect 
                                    key={`${r}-${c}`}
                                    x={c} 
                                    y={r} 
                                    width={1.05} 
                                    height={1.05} 
                                    fill={isEye ? config.eyeColor : config.fgColor} 
                                />
                             );
                        }
                        return null;
                    })
                )}
            </svg>
        );
    } catch (e) {
        return <QrCode className="w-full h-full text-gray-300 p-2" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Mis QRs</h2>
          <p className="text-gray-500">Gestiona tus códigos QR creados.</p>
        </div>
        <button 
          onClick={onCreateNew}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          Crear Nuevo
        </button>
      </div>

      {qrs.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 border-dashed">
            <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <QrCode className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tienes QRs todavía</h3>
            <p className="text-gray-500 mb-6 max-w-sm mx-auto">Crea tu primer código QR dinámico y comienza a compartir enlaces de forma profesional.</p>
            <button 
                onClick={onCreateNew}
                className="text-blue-600 font-medium hover:text-blue-700 hover:underline"
            >
                Empezar ahora &rarr;
            </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {qrs.map((qr) => (
            <div key={qr.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col">
              <div className="p-5 flex gap-4">
                {/* Left: Thumbnail */}
                <div className="w-24 h-24 flex-shrink-0 bg-gray-50 rounded-lg border border-gray-100 overflow-hidden relative group">
                    <QRThumbnail config={qr} />
                    {/* Logo Overlay on Thumbnail */}
                    {qr.logoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <img 
                                src={qr.logoUrl} 
                                className="object-contain" 
                                style={{ width: '25%', height: '25%' }} 
                                alt="logo" 
                            />
                        </div>
                    )}
                </div>

                {/* Right: Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                         <h3 className="font-bold text-gray-900 truncate pr-2" title={qr.title}>{qr.title || 'Sin Título'}</h3>
                         <span className={clsx(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0",
                            qr.qrType === 'dynamic' ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                        )}>
                            {qr.qrType === 'dynamic' ? 'DINÁMICO' : 'ESTÁTICO'}
                        </span>
                    </div>

                    <div className="space-y-2 mt-2">
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                            <LinkIcon className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{qr.destinationUrl}</span>
                        </div>
                        
                        {qr.qrType === 'dynamic' && (
                            <a 
                                href={`https://${DOMAIN}/${qr.shortUrlId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs text-blue-600 font-medium bg-blue-50/50 p-1.5 rounded-md hover:bg-blue-100 hover:text-blue-700 transition-colors w-full group/link"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate group-hover/link:underline">{DOMAIN}/{qr.shortUrlId}</span>
                            </a>
                        )}

                        <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1">
                            <Calendar className="w-3 h-3 flex-shrink-0" />
                            <span>
                                {qr.createdAt?.toDate ? qr.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                            </span>
                        </div>
                    </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="bg-gray-50 border-t border-gray-100 p-3 flex gap-2">
                <button 
                    onClick={() => onEdit(qr.id, qr)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Edit className="w-4 h-4" /> Editar
                </button>
                
                <button 
                    onClick={() => handleDownload(qr)}
                    disabled={downloadingId === qr.id}
                    className="w-10 flex items-center justify-center bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-600 text-gray-500 rounded-lg transition-colors"
                    title="Descargar QR"
                >
                    {downloadingId === qr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                </button>

                <button 
                    onClick={() => handleDelete(qr.id)}
                    disabled={deletingId === qr.id}
                    className="w-10 flex items-center justify-center bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 rounded-lg transition-colors"
                    title="Eliminar QR"
                >
                    {deletingId === qr.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};