import { AlertTriangle, X } from "lucide-react";
import { useState } from "react";

export default function LegalDisclaimer() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-amber-900/30 border-b border-amber-700/50">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 text-xs text-amber-200">
            <strong className="text-amber-300">Aviso Legal:</strong> Los colores Pantone mostrados son 
            aproximaciones no oficiales basadas en datasets de código abierto. Los valores pueden variar 
            respecto a las guías físicas oficiales de Pantone LLC. Para uso profesional de alta precisión 
            en impresión, consulte las guías físicas Pantone o utilice la API oficial de Pantone Connect. 
            El sistema PANTONE® es una marca registrada de Pantone LLC.
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-amber-400 hover:text-amber-300 transition-colors flex-shrink-0"
            aria-label="Cerrar aviso"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
