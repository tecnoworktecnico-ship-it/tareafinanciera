import React from 'react';

const AnimatedBackground = () => {
  // We use CSS keyframes (which will be in index.css) to move these elements smoothly
  return (
    <div aria-hidden="true" className="fixed inset-0 z-[-1] overflow-hidden bg-slate-50 dark:bg-slate-900 transition-colors duration-700 pointer-events-none">
      
      {/* Light Mode Elements */}
      <div className="absolute inset-0 dark:opacity-0 transition-opacity duration-700">
        <div className="absolute w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-blob" style={{ top: '10%', left: '20%', willChange: 'transform' }}></div>
        <div className="absolute w-96 h-96 bg-[#34A853]/5 rounded-full blur-3xl animate-blob animation-delay-2000" style={{ top: '40%', right: '10%', willChange: 'transform' }}></div>
        <div className="absolute w-[800px] h-[800px] bg-yellow-500/5 rounded-full blur-3xl animate-blob animation-delay-4000" style={{ bottom: '-20%', left: '-10%', willChange: 'transform' }}></div>
      </div>

      {/* Dark Mode Elements */}
      <div className="absolute inset-0 opacity-0 dark:opacity-100 transition-opacity duration-700">
         <div className="absolute w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] animate-blob" style={{ top: '10%', right: '20%', willChange: 'transform' }}></div>
         <div className="absolute w-[600px] h-[600px] bg-[#34A853]/10 rounded-full blur-[100px] animate-blob animation-delay-2000" style={{ bottom: '10%', left: '10%', willChange: 'transform' }}></div>
      </div>
      
      {/* Grid Pattern overlay for tech/finance vibe */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9Im5vbmUiLz4KPHBhdGggZD0iTTAgMTBoNDBNMTAgMHY0ME0wIDIwaDQwTTIwIDB2NDBNMCAzMGg0ME0zMCAwdjQwIiBzdHJva2U9InJnYmEoMTI4LCAxMjgsIDEyOCwgMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] [mask-image:linear-gradient(to_bottom,white,transparent)] dark:[mask-image:linear-gradient(to_bottom,rgba(255,255,255,0.2),transparent)]"></div>
    </div>
  );
};

export default AnimatedBackground;
