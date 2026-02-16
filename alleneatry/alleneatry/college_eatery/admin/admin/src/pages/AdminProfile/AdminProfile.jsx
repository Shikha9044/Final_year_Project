import React, { useState, useRef } from 'react';
import axios from 'axios';
import './AdminProfile.css';

const AdminProfile = ({ user, setUser }) => {
  const [editMode, setEditMode] = useState(false);
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');
  const [profilePicPreview, setProfilePicPreview] = useState(user?.profilePic || '');
  const fileInputRef = useRef();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicPreview(reader.result);
        setProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    let uploadUrl = '';
    if (profilePic && profilePic.startsWith('data:')) {
      const token = localStorage.getItem('token');
      const uploadRes = await axios.post('http://localhost:4000/api/admin/upload-profile-pic', { image: profilePic }, { headers: { token } });
      if (uploadRes.data.success) {
        uploadUrl = uploadRes.data.url;
      }
    }
    const updated = { ...user, name, email, profilePic: uploadUrl || profilePic };
    setUser(updated);
    localStorage.setItem('adminProfile', JSON.stringify(updated));
    setEditMode(false);
  };

  return (
    <div className="admin-profile-container">
      <div className="admin-profile-header">
        <div className="admin-profile-avatar" style={{position:'relative',cursor: editMode ? 'pointer' : 'default'}} onClick={() => editMode && fileInputRef.current.click()}>
          {profilePicPreview ? (
            <img src={profilePicPreview} alt="Profile" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:'50%'}} />
          ) : (
            <span>{name?.charAt(0)?.toUpperCase() || 'A'}</span>
          )}
          {editMode && (
            <span style={{position:'absolute',bottom:0,right:0,background:'#fff',borderRadius:'50%',padding:4,border:'1px solid #ccc',fontSize:12}}>✏️</span>
          )}
          <input type="file" accept="image/*" style={{display:'none'}} ref={fileInputRef} onChange={handleProfilePicChange} />
        </div>
        <div className="admin-profile-info">
          {editMode ? (
            <>
              <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name" />
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
            </>
          ) : (
            <>
              <h2>{name}</h2>
              <p>{email}</p>
            </>
          )}
        </div>
        <button className="admin-profile-edit-btn" onClick={()=>editMode ? handleSave() : setEditMode(true)}>
          {editMode ? 'Save' : 'Edit'}
        </button>
      </div>
    </div>
  );
};

export default AdminProfile;
