import { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, X, QrCode, UtensilsCrossed } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

export const QRModal = ({ isOpen, onClose, table, restaurant }) => {
  const printRef = useRef();

  if (!isOpen || !table || !restaurant) return null;

  const baseUrl = window.location.origin;
  const menuUrl = `${baseUrl}/menu/${restaurant.id}?table=${table.table_number}`;

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Imprimir QR - Mesa ${table.table_number}</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100;400;900&display=swap" rel="stylesheet">
          <style>
            @media print {
              body { margin: 0; padding: 0; }
              .no-print { display: none !important; }
            }
            body { font-family: 'Outfit', sans-serif; }
          </style>
        </head>
        <body class="bg-white">
          ${printContent}
          <script>
            window.onload = () => {
              window.print();
              setTimeout(() => { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-md overflow-y-auto font-outfit">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#fefcf8] rounded-[3.5rem] border border-primary-200 shadow-gold w-full max-w-lg overflow-hidden relative my-auto"
      >
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-400 to-primary-600"></div>

        {/* Header */}
        <div className="px-10 py-8 border-b border-primary-100 bg-white/50 flex items-center justify-between">
           <div>
              <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.4em] mb-1 block">Identidad Digital</span>
              <h2 className="text-3xl font-black text-ink tracking-tighter uppercase leading-none">Generador <span className="text-primary-500">QR</span></h2>
           </div>
           <button 
             onClick={onClose} 
             className="p-3 rounded-2xl bg-primary-100 text-primary-600 hover:bg-primary-500 hover:text-white transition-all shadow-sm"
           >
             <X className="w-6 h-6" />
           </button>
        </div>

        {/* Card Preview */}
        <div className="p-10" ref={printRef}>
          <div className="border-[12px] border-ink rounded-[3rem] p-10 flex flex-col items-center text-center bg-white shadow-2xl">
            {/* Logo y Nombre */}
            <div className="mb-8 flex flex-col items-center">
              <div className="w-24 h-24 bg-white rounded-3xl p-3 mb-4 shadow-xl border border-primary-100 flex items-center justify-center">
                <img src={restaurant.logo_url} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h2 className="text-3xl font-black text-ink tracking-tighter uppercase leading-none">{restaurant.name}</h2>
              <div className="mt-2 flex items-center gap-2">
                 <UtensilsCrossed className="w-3 h-3 text-primary-600" />
                 <span className="text-[10px] font-black text-primary-600 uppercase tracking-[0.3em]">Menú Digital Interactivo</span>
              </div>
            </div>

            {/* QR Code */}
            <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-primary-100 mb-8 relative">
              <QRCodeSVG 
                value={menuUrl}
                size={220}
                level="H"
                includeMargin={true}
                imageSettings={{
                  src: restaurant.logo_url,
                  x: undefined,
                  y: undefined,
                  height: 40,
                  width: 40,
                  excavate: true,
                }}
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest shadow-lg">
                 Scan Me
              </div>
            </div>

            {/* Identificador de Mesa */}
            <div className="mb-6">
              <span className="text-xs font-black text-muted-brown uppercase tracking-[0.4em] block mb-1">Tu lugar en la mesa</span>
              <span className="text-6xl font-black text-ink tracking-tighter uppercase">Mesa {table.table_number}</span>
            </div>
            
            <p className="text-xs text-muted-brown font-bold uppercase tracking-widest leading-relaxed max-w-[280px]">
              Explora nuestra carta digital y gestiona tu pedido directamente desde tu dispositivo.
            </p>

            <div className="mt-10 pt-8 border-t border-primary-100 w-full">
              <p className="text-[9px] font-black text-primary-300 tracking-[0.4em] uppercase">Powered by BuenProvecho OS</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-10 pb-10 flex gap-4 no-print">
          <Button
            variant="ghost"
            onClick={onClose}
            className="flex-1 py-5 rounded-[2rem]"
          >
            Cerrar
          </Button>
          <Button
            onClick={handlePrint}
            className="flex-1 py-5 rounded-[2rem] shadow-gold"
          >
            <Printer className="w-4 h-4 mr-2" /> 
            Imprimir
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

