import React from 'react';

interface ExamMetadata {
  titulo?: string;
  descripcion?: string;
  materia?: string;
  nivel_educativo?: string;
  idioma?: string;
  duracion_min?: number;
  dificultad?: string;
  cantidad_preguntas?: number;
  cantidad_opcion_multiple?: number;
  cantidad_verdadero_falso?: number;
}

interface ExamQuestion {
  id: number;
  tipo: 'opcion_multiple' | 'verdadero_falso';
  enunciado: string;
  opciones?: string[];
  respuesta_correcta?: number | boolean;
}

interface ExamContent {
  meta: ExamMetadata;
  preguntas: ExamQuestion[];
}

interface ExamViewerProps {
  content: ExamContent;
  title?: string;
}

export const ExamViewer: React.FC<ExamViewerProps> = ({ content, title }) => {
  const { meta, preguntas } = content;

  return (
    <div style={styles.container}>
      {/* Header Section */}
      <div style={styles.header}>
        <h2 style={styles.title}>{title || meta.titulo || 'Examen'}</h2>
        {meta.descripcion && <p style={styles.description}>{meta.descripcion}</p>}
      </div>

      {/* Metadata Section */}
      <div style={styles.metaCard}>
        <div style={styles.metaGrid}>
          {meta.materia && (
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>📚 Materia:</span>
              <span style={styles.metaValue}>{meta.materia}</span>
            </div>
          )}
          {meta.nivel_educativo && (
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>🎓 Nivel:</span>
              <span style={styles.metaValue}>{meta.nivel_educativo}</span>
            </div>
          )}
          {meta.duracion_min && (
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>⏱️ Duración:</span>
              <span style={styles.metaValue}>{meta.duracion_min} minutos</span>
            </div>
          )}
          {meta.dificultad && (
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>📊 Dificultad:</span>
              <span style={styles.metaValue}>{meta.dificultad}</span>
            </div>
          )}
          {meta.idioma && (
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>🌐 Idioma:</span>
              <span style={styles.metaValue}>{meta.idioma}</span>
            </div>
          )}
          {meta.cantidad_preguntas && (
            <div style={styles.metaItem}>
              <span style={styles.metaLabel}>❓ Total:</span>
              <span style={styles.metaValue}>{meta.cantidad_preguntas} preguntas</span>
            </div>
          )}
        </div>
      </div>

      {/* Questions Section */}
      <div style={styles.questionsContainer}>
        {preguntas && preguntas.length > 0 ? (
          preguntas.map((pregunta, index) => (
            <div key={pregunta.id || index} style={styles.questionCard}>
              <div style={styles.questionHeader}>
                <span style={styles.questionNumber}>{index + 1}.</span>
                <span style={styles.questionText}>{pregunta.enunciado}</span>
              </div>

              {pregunta.tipo === 'opcion_multiple' && pregunta.opciones && (
                <div style={styles.optionsContainer}>
                  {pregunta.opciones.map((opcion, i) => (
                    <div key={i} style={styles.optionItem}>
                      <span style={styles.optionLetter}>
                        {String.fromCharCode(97 + i)})
                      </span>
                      <span style={styles.optionText}>{opcion}</span>
                    </div>
                  ))}
                </div>
              )}

              {pregunta.tipo === 'verdadero_falso' && (
                <div style={styles.trueFalseContainer}>
                  <div style={styles.trueFalseOption}>
                    <span style={styles.checkbox}>☐</span>
                    <span style={styles.trueFalseLabel}>Verdadero</span>
                  </div>
                  <div style={styles.trueFalseOption}>
                    <span style={styles.checkbox}>☐</span>
                    <span style={styles.trueFalseLabel}>Falso</span>
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p style={styles.noQuestions}>No hay preguntas disponibles</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '1.5rem',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '2rem',
    paddingBottom: '1rem',
    borderBottom: '3px solid #1a1a2e',
  },
  title: {
    color: '#1a1a2e',
    fontSize: '1.8rem',
    fontWeight: 'bold' as const,
    margin: '0 0 0.5rem 0',
  },
  description: {
    color: '#666',
    fontSize: '1rem',
    margin: 0,
  },
  metaCard: {
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    padding: '1.5rem',
    marginBottom: '2rem',
  },
  metaGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '1rem',
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  metaLabel: {
    fontWeight: 'bold' as const,
    color: '#1a1a2e',
    fontSize: '0.95rem',
  },
  metaValue: {
    color: '#333',
    fontSize: '0.95rem',
  },
  questionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1.5rem',
  },
  questionCard: {
    backgroundColor: '#fafafa',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    padding: '1.25rem',
    transition: 'box-shadow 0.2s',
  },
  questionHeader: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  questionNumber: {
    fontWeight: 'bold' as const,
    fontSize: '1.1rem',
    color: '#1a1a2e',
    minWidth: '2rem',
  },
  questionText: {
    fontSize: '1.05rem',
    color: '#333',
    lineHeight: '1.6',
    flex: 1,
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.75rem',
    marginLeft: '2.75rem',
  },
  optionItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderLeft: '3px solid #4CAF50',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  optionLetter: {
    fontWeight: 'bold' as const,
    color: '#4CAF50',
    minWidth: '1.5rem',
  },
  optionText: {
    color: '#333',
    lineHeight: '1.5',
    flex: 1,
  },
  trueFalseContainer: {
    display: 'flex',
    gap: '2rem',
    marginLeft: '2.75rem',
    marginTop: '0.5rem',
  },
  trueFalseOption: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.25rem',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  checkbox: {
    fontSize: '1.2rem',
    color: '#4CAF50',
  },
  trueFalseLabel: {
    fontSize: '1rem',
    color: '#333',
    fontStyle: 'italic' as const,
  },
  noQuestions: {
    textAlign: 'center' as const,
    color: '#999',
    padding: '2rem',
    fontSize: '1rem',
  },
};
