export function classifyExpense(description: string): string {
    const desc = description.toLowerCase();
    
    // Reglas basadas en palabras clave
    if (desc.includes('uber') || desc.includes('taxi') || desc.includes('gas') || desc.includes('bus')) {
        return 'Transporte';
    }
    if (desc.includes('supermercado') || desc.includes('walmart') || desc.includes('comida') || desc.includes('restaurant')) {
        return 'Alimentación';
    }
    if (desc.includes('netflix') || desc.includes('spotify') || desc.includes('prime') || desc.includes('suscripcion')) {
        return 'Suscripciones';
    }
    if (desc.includes('farmacia') || desc.includes('hospital') || desc.includes('doctor')) {
        return 'Salud';
    }
    
    return 'Otros Gastos';
}
