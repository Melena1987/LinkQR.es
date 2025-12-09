import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { QRConfig } from '../../types';
import { Loader2, Trash2, Edit, Calendar, Link as LinkIcon, ExternalLink, QrCode } from 'lucide-react';
import { clsx } from 'clsx';
import { DOMAIN } from '../../constants';

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
      // Fallback if index is missing (orderBy can fail without composite index)
      // Try fetching without orderBy and sorting client side
      try {
        const q2 = query(collection(db, 'qrs'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q2);
        const fetchedQrs: SavedQR[] = [];
        querySnapshot.forEach((doc) => {
           fetchedQrs.push({ id: doc.id, ...doc.data() } as SavedQR);
        });
        // Client side sort
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
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                    <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-100">
                        {qr.logoUrl ? (
                            <img src={qr.logoUrl} className="w-8 h-8 object-contain" alt="Logo" />
                        ) : (
                            <QrCode className="w-6 h-6 text-gray-400" />
                        )}
                    </div>
                    <span className={clsx(
                        "text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wide",
                        qr.qrType === 'dynamic' ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
                    )}>
                        {qr.qrType === 'dynamic' ? 'Dinámico' : 'Estático'}
                    </span>
                </div>
                
                <h3 className="font-bold text-gray-900 mb-1 truncate">{qr.title || 'Sin Título'}</h3>
                
                <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                        <LinkIcon className="w-3.5 h-3.5" />
                        <span className="truncate max-w-[200px]">{qr.destinationUrl}</span>
                    </div>
                    {qr.qrType === 'dynamic' && (
                        <div className="flex items-center gap-2 text-xs text-blue-600 font-medium bg-blue-50/50 p-1.5 rounded-md">
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span className="truncate">{DOMAIN}/{qr.shortUrlId}</span>
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-gray-400 pt-2 border-t border-gray-50">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>
                            {qr.createdAt?.toDate ? qr.createdAt.toDate().toLocaleDateString() : 'Reciente'}
                        </span>
                    </div>
                </div>
              </div>

              <div className="bg-gray-50 border-t border-gray-100 p-3 flex gap-2">
                <button 
                    onClick={() => onEdit(qr.id, qr)}
                    className="flex-1 flex items-center justify-center gap-2 bg-white border border-gray-200 hover:border-blue-500 hover:text-blue-600 text-gray-700 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                    <Edit className="w-4 h-4" /> Editar
                </button>
                <button 
                    onClick={() => handleDelete(qr.id)}
                    disabled={deletingId === qr.id}
                    className="w-10 flex items-center justify-center bg-white border border-gray-200 hover:bg-red-50 hover:border-red-200 hover:text-red-600 text-gray-500 rounded-lg transition-colors"
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