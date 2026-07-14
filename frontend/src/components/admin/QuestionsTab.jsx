// src/components/admin/QuestionsTab.jsx
import React, { useState, useRef, useEffect } from 'react';
import uploadService from '../../services/uploadService';

// ============================================
// HELPER: Get display URL (Vite compatible)
// ============================================
const getDisplayUrl = (url) => {
  if (!url) return null;
  
  // If it's already a full URL, return as-is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path starting with /uploads, prepend the API base URL
  if (url.startsWith('/uploads/')) {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    return `${baseUrl}${url}`;
  }
  
  return url;
};

// ============================================
// QUESTION MODAL
// ============================================
const QuestionModal = ({ isOpen, onClose, onSave, editingQuestion, selectedType }) => {
  const [formData, setFormData] = useState(getEmptyQuestion());
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (editingQuestion) {
      setFormData({
        type: editingQuestion.type,
        category: editingQuestion.category,
        question: editingQuestion.question,
        options: editingQuestion.options || [],
        correct: String(editingQuestion.correct),
        answer: editingQuestion.answer || '',
        image_url: editingQuestion.image_url || '',
        description: editingQuestion.description || '',
        audio_url: editingQuestion.audio_url || '',
        points: editingQuestion.points || 10,
        is_active: editingQuestion.is_active !== undefined ? editingQuestion.is_active : true,
      });
      setImagePreview(editingQuestion.image_url || null);
      setAudioPreview(editingQuestion.audio_url || null);
      setSuccessMessage('');
    } else {
      const newForm = getEmptyQuestion();
      if (selectedType) {
        newForm.type = selectedType;
      }
      setFormData(newForm);
      setSuccessMessage('');
    }
    setImageFile(null);
    setAudioFile(null);
  }, [editingQuestion, isOpen, selectedType]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleOptionChange = (index, value) => {
    const currentOptions = formData.options || [];
    const newOptions = [...currentOptions];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, image_url: '' }));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveAudio = () => {
    setAudioFile(null);
    setAudioPreview(null);
    setFormData(prev => ({ ...prev, audio_url: '' }));
    if (audioInputRef.current) {
      audioInputRef.current.value = '';
    }
  };

  const uploadFiles = async () => {
    let uploadedImageUrl = formData.image_url;
    let uploadedAudioUrl = formData.audio_url;

    if (imageFile) {
      setImageUploading(true);
      try {
        const result = await uploadService.uploadImage(imageFile);
        if (result.success && result.data) {
          const fileData = Array.isArray(result.data) ? result.data[0] : result.data;
          uploadedImageUrl = fileData.url;
          setSuccessMessage('✅ Image uploaded successfully!');
        } else {
          throw new Error(result.error || 'Image upload failed');
        }
      } catch (error) {
        console.error('Image upload error:', error);
        setSuccessMessage('❌ Failed to upload image: ' + (error.message || 'Unknown error'));
        throw error;
      } finally {
        setImageUploading(false);
      }
    }

    if (audioFile) {
      setAudioUploading(true);
      try {
        const result = await uploadService.uploadAudio(audioFile);
        if (result.success && result.data) {
          const fileData = Array.isArray(result.data) ? result.data[0] : result.data;
          uploadedAudioUrl = fileData.url;
          setSuccessMessage('✅ Audio uploaded successfully!');
        } else {
          throw new Error(result.error || 'Audio upload failed');
        }
      } catch (error) {
        console.error('Audio upload error:', error);
        setSuccessMessage('❌ Failed to upload audio: ' + (error.message || 'Unknown error'));
        throw error;
      } finally {
        setAudioUploading(false);
      }
    }

    return { uploadedImageUrl, uploadedAudioUrl };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.type || !formData.category || !formData.question || !formData.correct) {
      setSuccessMessage('❌ Please fill in all required fields');
      return;
    }

    setLoading(true);
    setSuccessMessage('⏳ Saving question...');
    
    try {
      let uploadedImageUrl = formData.image_url;
      let uploadedAudioUrl = formData.audio_url;
      
      if (imageFile || audioFile) {
        const uploadResult = await uploadFiles();
        uploadedImageUrl = uploadResult.uploadedImageUrl || uploadedImageUrl;
        uploadedAudioUrl = uploadResult.uploadedAudioUrl || uploadedAudioUrl;
      }
      
      const data = { ...formData };
      
      if (uploadedImageUrl) data.image_url = uploadedImageUrl;
      if (uploadedAudioUrl) data.audio_url = uploadedAudioUrl;
      
      if (data.type === 'choice') {
        const optionsArray = Array.isArray(data.options) ? data.options : [];
        const filteredOptions = optionsArray
          .filter(opt => opt && typeof opt === 'string' && opt.trim() !== '')
          .map(opt => opt.trim());
        data.options = filteredOptions.length > 0 ? filteredOptions : null;
      } else {
        data.options = null;
      }
      
      if (data.type === 'truefalse') {
        data.correct = data.correct === 'true' ? 'true' : 'false';
      }
      
      if (data.type === 'choice' && data.correct !== undefined && data.correct !== '') {
        data.correct = parseInt(data.correct);
      }
      
      delete data.card_number;
      
      await onSave(data);
      
      if (!editingQuestion) {
        setSuccessMessage('✅ Question saved! Add another...');
        const newForm = getEmptyQuestion();
        newForm.type = formData.type;
        setFormData(newForm);
        setImageFile(null);
        setAudioFile(null);
        setImagePreview(null);
        setAudioPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (audioInputRef.current) audioInputRef.current.value = '';
        setTimeout(() => {
          const questionInput = document.querySelector('textarea[name="question"]');
          if (questionInput) questionInput.focus();
        }, 100);
      } else {
        setSuccessMessage('✅ Question updated!');
        setTimeout(() => {
          onClose();
        }, 800);
      }
    } catch (error) {
      console.error('Error saving question:', error);
      setSuccessMessage('❌ Error saving question: ' + (error.message || 'Unknown error'));
    }
    setLoading(false);
  };

  if (!isOpen) return null;

  const getTimeLimit = (type) => {
    const limits = { sign: 30, proverb: 30, choice: 15, truefalse: 15, short: 15, song: 60 };
    return limits[type] || 30;
  };

  const getCategoryOptions = (type) => {
    const categories = {
      sign: ['Sign Language', 'Basic Signs', 'Advanced Signs'],
      proverb: ['Bible Proverb', 'Wisdom', 'Old Testament', 'New Testament'],
      choice: ['General Knowledge', 'Bible', 'History', 'Geography'],
      truefalse: ['Bible Truth', 'General Knowledge', 'History'],
      short: ['Bible Quick', 'New Testament', 'Old Testament', 'Psalms'],
      song: ['Guess the Song', 'Hymns', 'Worship']
    };
    return categories[type] || ['General'];
  };

  return (
    <div style={modalStyles.overlay} onClick={onClose}>
      <div style={modalStyles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.modalHeader}>
          <h2>{editingQuestion ? '✏️ Edit Question' : '📝 New Question'}</h2>
          <button onClick={onClose} style={modalStyles.closeBtn}>✕</button>
        </div>
        
        <form onSubmit={handleSubmit} style={modalStyles.modalBody}>
          {successMessage && (
            <div style={{
              ...modalStyles.successMessage,
              backgroundColor: successMessage.startsWith('❌') ? '#f8d7da' : 
                             successMessage.startsWith('⏳') ? '#fff3cd' : '#d4edda',
              color: successMessage.startsWith('❌') ? '#721c24' : 
                     successMessage.startsWith('⏳') ? '#856404' : '#155724',
            }}>
              {successMessage}
            </div>
          )}
          
          <div style={modalStyles.formRow}>
            <div style={modalStyles.formGroup}>
              <label>Type *</label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                style={modalStyles.input}
                required
              >
                <option value="choice">Multiple Choice</option>
                <option value="truefalse">True/False</option>
                <option value="short">Short Answer</option>
                <option value="sign">Sign Language</option>
                <option value="proverb">Bible Proverb</option>
                <option value="song">Guess the Song</option>
              </select>
              <small style={modalStyles.helperText}>⏱️ Time: {getTimeLimit(formData.type)}s</small>
            </div>
            <div style={modalStyles.formGroup}>
              <label>Category *</label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                style={modalStyles.input}
                required
              >
                <option value="">Select Category</option>
                {getCategoryOptions(formData.type).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={modalStyles.formGroup}>
            <label>Question *</label>
            <textarea
              name="question"
              value={formData.question}
              onChange={(e) => handleChange('question', e.target.value)}
              style={modalStyles.textarea}
              placeholder="Enter question"
              rows="2"
              required
            />
          </div>

          {formData.type === 'choice' && (
            <div style={modalStyles.formGroup}>
              <label>Options</label>
              {[0, 1, 2, 3].map((i) => (
                <input
                  key={i}
                  type="text"
                  value={(formData.options && formData.options[i]) || ''}
                  onChange={(e) => handleOptionChange(i, e.target.value)}
                  style={{ ...modalStyles.input, marginBottom: '6px' }}
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                />
              ))}
              <small style={modalStyles.helperText}>Leave blank for options you don't want to use</small>
            </div>
          )}

          <div style={modalStyles.formGroup}>
            <label>Correct Answer *</label>
            {formData.type === 'truefalse' ? (
              <select
                value={formData.correct}
                onChange={(e) => handleChange('correct', e.target.value)}
                style={modalStyles.input}
                required
              >
                <option value="">Select</option>
                <option value="true">✅ True</option>
                <option value="false">❌ False</option>
              </select>
            ) : formData.type === 'choice' ? (
              <select
                value={formData.correct}
                onChange={(e) => handleChange('correct', e.target.value)}
                style={modalStyles.input}
                required
              >
                <option value="">Select Correct Option</option>
                {(formData.options || []).map((opt, idx) => (
                  opt && opt.trim() !== '' && <option key={idx} value={idx}>{String.fromCharCode(65 + idx)}. {opt}</option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={formData.correct}
                onChange={(e) => handleChange('correct', e.target.value)}
                style={modalStyles.input}
                placeholder={
                  formData.type === 'short' ? 'Short answer' : 
                  formData.type === 'sign' ? 'What is shown in the image?' :
                  formData.type === 'proverb' ? 'Complete the proverb' :
                  formData.type === 'song' ? 'Song name' :
                  'Correct answer'
                }
                required
              />
            )}
          </div>

          {(formData.type === 'sign') && (
            <>
              <div style={modalStyles.formGroup}>
                <label>Image</label>
                <div style={modalStyles.uploadRow}>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={(e) => handleChange('image_url', e.target.value)}
                    style={{ ...modalStyles.input, flex: 1 }}
                    placeholder="https://example.com/image.jpg or upload"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={modalStyles.uploadBtn}
                    disabled={imageUploading}
                  >
                    {imageUploading ? '⏳' : '📁'}
                  </button>
                  {(imageFile || imagePreview) && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      style={modalStyles.removeBtn}
                    >
                      ✕
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: 'none' }}
                  />
                </div>
                {(imagePreview || formData.image_url) && (
                  <div style={modalStyles.previewContainer}>
                    <img 
                      src={imagePreview || getDisplayUrl(formData.image_url)} 
                      alt="Preview" 
                      style={modalStyles.previewImage}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <div style={modalStyles.formGroup}>
                <label>Image Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  style={modalStyles.input}
                  placeholder="Describe the image"
                />
              </div>
            </>
          )}

          {formData.type === 'song' && (
            <div style={modalStyles.formGroup}>
              <label>Audio</label>
              <div style={modalStyles.uploadRow}>
                <input
                  type="text"
                  value={formData.audio_url}
                  onChange={(e) => handleChange('audio_url', e.target.value)}
                  style={{ ...modalStyles.input, flex: 1 }}
                  placeholder="https://example.com/song.mp3 or upload"
                />
                <button
                  type="button"
                  onClick={() => audioInputRef.current?.click()}
                  style={modalStyles.uploadBtn}
                  disabled={audioUploading}
                >
                  {audioUploading ? '⏳' : '📁'}
                </button>
                {(audioFile || audioPreview) && (
                  <button
                    type="button"
                    onClick={handleRemoveAudio}
                    style={modalStyles.removeBtn}
                  >
                    ✕
                  </button>
                )}
                <input
                  ref={audioInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleAudioSelect}
                  style={{ display: 'none' }}
                />
              </div>
              {(audioPreview || formData.audio_url) && (
                <div style={modalStyles.previewContainer}>
                  <audio controls style={{ width: '100%' }}>
                    <source src={audioPreview || getDisplayUrl(formData.audio_url)} />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              )}
            </div>
          )}

          <div style={modalStyles.formGroup}>
            <label>
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleChange('is_active', e.target.checked)}
                style={{ marginRight: '8px' }}
              />
              Active
            </label>
          </div>

          <div style={modalStyles.modalFooter}>
            <button type="button" onClick={onClose} style={modalStyles.cancelBtn}>Cancel</button>
            <button type="submit" style={modalStyles.submitBtn} disabled={loading || imageUploading || audioUploading}>
              {loading ? 'Saving...' : (editingQuestion ? 'Update' : 'Save & Add Next ➕')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

function getEmptyQuestion() {
  return {
    type: 'choice',
    category: '',
    question: '',
    options: [],
    correct: '',
    answer: '',
    image_url: '',
    description: '',
    audio_url: '',
    points: 10,
    is_active: true,
  };
}

// ============================================
// QUESTIONS TAB COMPONENT
// ============================================
const QuestionsTab = ({
  questions,
  selectedType,
  setSelectedType,
  selectedStatus,
  setSelectedStatus,
  searchTerm,
  setSearchTerm,
  handleAddQuestion,
  handleEditQuestion,
  handleDeleteQuestion,
  getTimeLimit,
  currentPage,
  totalPages,
  paginate,
  totalItems,
  itemsPerPage,
  loading,
  isModalOpen,
  setIsModalOpen,
  editingQuestion,
  setEditingQuestion,
  selectedTypeForAdd,
  handleSaveQuestion,
  handleCloseModal
}) => {
  if (loading) {
    return <div style={styles.loading}>Loading questions...</div>;
  }

  return (
    <div>
      <div style={styles.toolbar}>
        <select 
          value={selectedType} 
          onChange={(e) => { setSelectedType(e.target.value); }}
          style={styles.select}
        >
          <option value="all">All Types</option>
          <option value="sign">Sign Language</option>
          <option value="proverb">Bible Proverb</option>
          <option value="choice">Multiple Choice</option>
          <option value="truefalse">True/False</option>
          <option value="short">Short Answer</option>
          <option value="song">Guess the Song</option>
        </select>
        
        <select 
          value={selectedStatus} 
          onChange={(e) => { setSelectedStatus(e.target.value); }}
          style={styles.select}
        >
          <option value="all">All Status</option>
          <option value="active">✅ Active</option>
          <option value="inactive">❌ Processed</option>
        </select>
        
        <input
          type="text"
          placeholder="🔍 Search questions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={styles.searchInput}
        />
        
        <button onClick={handleAddQuestion} style={styles.addBtn}>
          ➕ Add Question
        </button>
      </div>

      {/* Questions Table */}
      <div style={styles.tableWrap}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ width: '4%' }}>ID</th>
              <th style={{ width: '7%' }}>Type</th>
              <th style={{ width: '5%' }}>⏱️</th>
              <th style={{ width: '10%' }}>Category</th>
              <th style={{ width: '18%' }}>Question</th>
              <th style={{ width: '14%' }}>Image</th>
              <th style={{ width: '10%' }}>Audio</th>
              <th style={{ width: '12%' }}>Correct</th>
              <th style={{ width: '8%' }}>Status</th>
              <th style={{ width: '10%' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 ? (
              <tr>
                <td colSpan="10" style={{textAlign: 'center', color: '#6c757d', padding: '20px'}}>
                  No questions found.
                </td>
              </tr>
            ) : (
              questions.map((q) => (
                <tr key={q.id}>
                  <td style={{ textAlign: 'center' }}>{q.id}</td>
                  <td>{q.type}</td>
                  <td style={{ textAlign: 'center' }}>{getTimeLimit(q.type)}s</td>
                  <td>{q.category}</td>
                  <td style={{ wordBreak: 'break-word' }}>
                    {q.question && q.question.length > 30 ? q.question.substring(0, 30) + '...' : q.question}
                  </td>
                  <td>
                    {q.image_url ? (
                      <div style={{ width: '50px', height: '50px', overflow: 'hidden', borderRadius: '4px' }}>
                        <img 
                          src={getDisplayUrl(q.image_url)} 
                          alt={q.description || 'Question image'} 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <span style={{ color: '#adb5bd', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    {q.audio_url ? (
                      <audio controls style={{ width: '80px', height: '30px' }}>
                        <source src={getDisplayUrl(q.audio_url)} />
                        Your browser does not support the audio element.
                      </audio>
                    ) : (
                      <span style={{ color: '#adb5bd', fontSize: '0.8rem' }}>—</span>
                    )}
                  </td>
                  <td>
                    {q.type === 'truefalse' ? (
                      q.correct === 'true' ? '✅ True' : '❌ False'
                    ) : q.type === 'choice' ? (
                      q.options && q.options[parseInt(q.correct)] ? 
                        `${String.fromCharCode(65 + parseInt(q.correct))}. ${q.options[parseInt(q.correct)]}` : 
                        String(q.correct)
                    ) : (
                      String(q.correct)
                    )}
                  </td>
                  <td>
                    <span style={{
                      color: q.is_active ? '#28a745' : '#dc3545',
                      fontWeight: 'bold'
                    }}>
                      {q.is_active ? '✅ Active' : '❌ Processed'}
                    </span>
                  </td>
                  <td>
                    <button onClick={() => handleEditQuestion(q)} style={styles.editBtn}>✏️</button>
                    <button onClick={() => handleDeleteQuestion(q.id)} style={styles.deleteBtn}>🗑️</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={styles.pagination}>
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            style={{...styles.pageBtn, ...(currentPage === 1 ? styles.pageBtnDisabled : {})}}
          >
            ◀
          </button>
          <span style={styles.pageInfo}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            style={{...styles.pageBtn, ...(currentPage === totalPages ? styles.pageBtnDisabled : {})}}
          >
            ▶
          </button>
          <span style={styles.pageInfo}>
            ({questions.length} of {totalItems})
          </span>
        </div>
      )}

      {/* Question Modal */}
      <QuestionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveQuestion}
        editingQuestion={editingQuestion}
        selectedType={selectedTypeForAdd}
      />
    </div>
  );
};

// ============================================
// STYLES
// ============================================
const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
  },
  modal: {
    background: 'white',
    borderRadius: '12px',
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e9ecef',
  },
  modalBody: {
    padding: '20px',
  },
  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #e9ecef',
    marginTop: '16px',
  },
  closeBtn: {
    background: 'none',
    borderStyle: 'none',
    borderWidth: '0',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: '#6c757d',
    padding: '4px 8px',
    borderRadius: '4px',
  },
  successMessage: {
    padding: '10px 15px',
    borderRadius: '6px',
    marginBottom: '15px',
    fontSize: '0.95rem',
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
    marginBottom: '12px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '8px',
  },
  helperText: {
    fontSize: '0.8rem',
    color: '#6c757d',
    marginTop: '2px',
  },
  input: {
    padding: '8px 12px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#ced4da',
    fontSize: '0.95rem',
    background: 'white',
    color: '#333',
  },
  textarea: {
    padding: '8px 12px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#ced4da',
    fontSize: '0.95rem',
    fontFamily: 'inherit',
    resize: 'vertical',
    background: 'white',
    color: '#333',
  },
  uploadRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  uploadBtn: {
    padding: '8px 12px',
    background: '#6c757d',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    whiteSpace: 'nowrap',
  },
  removeBtn: {
    padding: '4px 8px',
    background: '#dc3545',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.8rem',
    whiteSpace: 'nowrap',
  },
  previewContainer: {
    marginTop: '8px',
    padding: '8px',
    background: '#f8f9fa',
    borderRadius: '6px',
    border: '1px solid #dee2e6',
  },
  previewImage: {
    maxWidth: '100%',
    maxHeight: '150px',
    borderRadius: '4px',
    objectFit: 'contain',
  },
  submitBtn: {
    padding: '8px 24px',
    background: '#007bff',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  cancelBtn: {
    padding: '8px 24px',
    background: '#6c757d',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
};

const styles = {
  toolbar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  select: {
    padding: '8px 12px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#ced4da',
    fontSize: '0.95rem',
    background: 'white',
    color: '#333',
    minWidth: '150px',
  },
  searchInput: {
    padding: '8px 12px',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#ced4da',
    fontSize: '0.95rem',
    flex: '1',
    minWidth: '200px',
    background: 'white',
    color: '#333',
  },
  addBtn: {
    padding: '8px 16px',
    background: '#28a745',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.95rem',
  },
  tableWrap: {
    overflowX: 'auto',
    marginTop: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.9rem',
    tableLayout: 'fixed',
  },
  editBtn: {
    padding: '4px 8px',
    background: '#ffc107',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '4px',
    cursor: 'pointer',
    marginRight: '4px',
    fontSize: '0.85rem',
  },
  deleteBtn: {
    padding: '4px 8px',
    background: '#dc3545',
    color: 'white',
    borderStyle: 'none',
    borderWidth: '0',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem',
  },
  pagination: {
    display: 'flex',
    gap: '8px',
    marginTop: '15px',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  pageBtn: {
    padding: '6px 12px',
    background: '#f8f9fa',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#dee2e6',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    color: '#333',
  },
  pageBtnActive: {
    background: '#007bff',
    borderColor: '#007bff',
    color: 'white',
  },
  pageBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  pageInfo: {
    fontSize: '0.9rem',
    color: '#6c757d',
    marginLeft: '10px',
  },
  loading: {
    textAlign: 'center',
    padding: '40px',
    color: '#6c757d',
    fontSize: '1.1rem',
  },
};

export default QuestionsTab;