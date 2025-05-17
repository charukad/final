import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import PlainTextEditor from "../components/editor/PlainTextEditor";
import EditorSidebar from "../components/editor/EditorSidebar";
import EditorHeader from "../components/editor/EditorHeader";
import MobileEditorHeader from "../components/editor/MobileEditorHeader";
import AIAssistantPanel from "../components/ai-assistant/AIAssistantPanel";
import NoteFlowGPT from "../components/ai-assistant/NoteFlowGPT";
import CollaborationPanel from "../components/collaboration/CollaborationPanel";
import NoSocketModal from "../components/common/NoSocketModal";
import { getNoteById, createNote, updateNote } from "../services/noteService";
import socketService from "../services/socketService";
import MarkdownPreview from "../components/editor/MarkdownPreview";
import "../styles/Editor.css";

const EditorPage = () => {
  // Get parameters and location
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Using optional chaining to safely access id
  const id = params?.id;
  
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showNoteFlowGPT, setShowNoteFlowGPT] = useState(false);
  const [showCollaborationPanel, setShowCollaborationPanel] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [COMMENTS, setComments] = useState([]);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showSocketModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef(null);

  // Content change debounce
  const contentDebounceTimeout = useRef(null);

  // Keep track of whether changes came from this user or remote
  const isRemoteChange = useRef(false);

  console.log("EditorPage rendering:", {
    pathname: location.pathname,
    id: id,
    params: params,
    noteState: note ? `note id: ${note._id}` : "null"
  });
  
  // Check socket connection on mount
  useEffect(() => {
    // Comment out or disable the socket connection check to prevent modal from showing
    /*
    const timer = setTimeout(() => {
      if (!socketService.isConnected()) {
        console.log("Socket not connected, showing modal");
        setShowSocketModal(true);
      }
    }, 2000);
    
    return () => clearTimeout(timer);
    */
    
    // Socket check disabled - continue without checking socket connection
    console.log("Socket connection check bypassed");
    
    // Force socket service to be enabled without checking connection
    socketService.enableSocket();
    
    return () => {};
  }, []);

  // Fetch note data or create new note
  useEffect(() => {
    const fetchNote = async () => {
      setLoading(true);
      try {
        console.log("Fetching note with params:", params, "pathname:", location.pathname);
        
        // Special handling for /notes/new route
        if (location.pathname === "/notes/new") {
          console.log("Creating new note from /notes/new route");
          const newNote = {
            _id: "new",
            title: "Untitled Note",
            content: "",
            tags: [],
            folder: null,
            isFavorite: false,
            collaborators: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setNote(newNote);
          return; // Exit early
        }
        
        // Handle case when accessing /notes/new via id param
        if (id === "new") {
          console.log("Creating new note via id=new parameter");
          const newNote = {
            _id: "new",
            title: "Untitled Note",
            content: "",
            tags: [],
            folder: null,
            isFavorite: false,
            collaborators: [],
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          setNote(newNote);
        } 
        // Handle case when accessing an existing note
        else if (id) {
          console.log("Fetching existing note with ID:", id);
          const fetchedNote = await getNoteById(id);
          console.log("Fetched note:", fetchedNote);
          
          if (!fetchedNote) {
            throw new Error("Note not found");
          }
          
          setNote(fetchedNote);
          // If note has comments, set them
          if (fetchedNote.comments && fetchedNote.comments.length > 0) {
            setComments(fetchedNote.comments);
          }
        } 
        // Handle case when no ID is provided at all
        else {
          console.log("No note ID provided, redirecting to dashboard");
          navigate("/dashboard");
          return;
        }
      } catch (error) {
        console.error("Error fetching note:", error);
        setError("Failed to load note. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, params, location.pathname, navigate]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Set up socket connection for real-time collaboration
  useEffect(() => {
    if (!note || note._id === "new") return;

    // Get socket instance
    const socket = socketService.getSocket();
    if (!socket || !socket.connected) {
      console.log("Socket not connected, collaboration features will be limited");
      return;
    }

    // Join note room
    const joined = socketService.joinNote(note._id);
    if (!joined) {
      console.warn(`Failed to join note room for note ${note._id}`);
    }

    // Listen for users joining/leaving
    socket.on("user-joined", (data) => {
      console.log(`${data.userName} joined the document`);
      setActiveUsers((prevUsers) => [
        ...prevUsers,
        { userId: data.userId, userName: data.userName },
      ]);
    });

    socket.on("user-left", (data) => {
      console.log(`${data.userName} left the document`);
      setActiveUsers((prevUsers) =>
        prevUsers.filter((user) => user.userId !== data.userId)
      );
    });

    socket.on("active-users", (users) => {
      setActiveUsers(users);
    });

    // Listen for content changes
    socket.on("content-changed", (data) => {
      isRemoteChange.current = true;
      setNote((prevNote) => ({
        ...prevNote,
        content: data.content,
        updatedAt: new Date().toISOString(),
      }));
    });

    // Listen for title changes
    socket.on("title-changed", (data) => {
      setNote((prevNote) => ({
        ...prevNote,
        title: data.title,
        updatedAt: new Date().toISOString(),
      }));
    });

    // Listen for comments
    socket.on("comment-added", (data) => {
      setComments((prevComments) => [...prevComments, data]);
    });

    socket.on("comment-resolved", (data) => {
      setComments((prevComments) =>
        prevComments.map((comment) =>
          comment.id === data.commentId
            ? {
                ...comment,
                resolved: true,
                resolvedBy: data.resolvedBy,
                resolvedAt: data.resolvedAt,
              }
            : comment
        )
      );
    });

    // Listen for collaborator changes
    socket.on("collaborator-joined", (data) => {
      setNote((prevNote) => ({
        ...prevNote,
        collaborators: [
          ...(prevNote.collaborators || []),
          {
            user: { _id: data.userId, fullName: data.userName },
            permissionLevel: data.permissionLevel,
          },
        ],
      }));
    });

    socket.on("collaborator-removed", (data) => {
      setNote((prevNote) => ({
        ...prevNote,
        collaborators: (prevNote.collaborators || []).filter(
          (c) => c.user._id !== data.userId
        ),
      }));
    });

    // Cleanup function to remove listeners
    return () => {
      if (socket) {
      socket.off("user-joined");
      socket.off("user-left");
      socket.off("active-users");
      socket.off("content-changed");
      socket.off("title-changed");
      socket.off("comment-added");
      socket.off("comment-resolved");
      socket.off("collaborator-joined");
      socket.off("collaborator-removed");
        
        // Leave the note room
        socketService.leaveNote(note._id);
      }
    };
  }, [note]);

  // Handle title change
  const handleTitleChange = (newTitle) => {
    if (!note) return;
    
    console.log("Title changed:", newTitle);
    setNote((prevNote) => ({
      ...prevNote,
      title: newTitle,
      updatedAt: new Date().toISOString(),
    }));

    // Emit title change to collaborators if not a new note
    if (note._id !== "new") {
      socketService.sendTitleChange(note._id, newTitle);
    }

    // Save after a delay if it's a new note
    if (note._id === "new") {
      if (contentDebounceTimeout.current) {
        clearTimeout(contentDebounceTimeout.current);
      }
      contentDebounceTimeout.current = setTimeout(() => {
        saveNote({ ...note, title: newTitle });
      }, 2000);
    }
  };

  // Handle content change
  const handleContentChange = (newContent) => {
    if (!note) return;
    
    // Skip saving this change if it came from another user
    if (isRemoteChange.current) {
      isRemoteChange.current = false;
      return;
    }

    // Update the note content in state
    setNote((prevNote) => ({
      ...prevNote,
      content: newContent,
      updatedAt: new Date().toISOString(),
    }));

    // Emit content change to collaborators if not a new note
    if (note._id !== "new") {
      socketService.sendContentChange(note._id, newContent);
    }

    // Save after a short delay - make sure to get the most recent note state
    if (contentDebounceTimeout.current) {
      clearTimeout(contentDebounceTimeout.current);
    }
    
    contentDebounceTimeout.current = setTimeout(() => {
      const updatedNote = {
        ...note,
        content: newContent,
        updatedAt: new Date().toISOString()
      };
      console.log("Saving note with content length:", newContent.length);
      saveNote(updatedNote);
    }, 2000);
  };

  // Auto-save functionality
  useEffect(() => {
    if (!note || (note._id === "new" && !note.content)) return;

    const saveTimer = setTimeout(() => {
      saveNote(note);
    }, 3000); // Auto-save after 3 seconds of inactivity

    return () => clearTimeout(saveTimer);
  }, [note?.content]);

  // Save note function
  const saveNote = async (noteData) => {
    if (!noteData) return;

    setSaving(true);
    try {
      let savedNote;
      if (noteData._id === "new") {
        // Create new note
        savedNote = await createNote(noteData);
        // Update URL to include the new note ID
        navigate(`/notes/${savedNote._id}`, { replace: true });
      } else {
        // Update existing note
        savedNote = await updateNote(noteData._id, noteData);
      }

      // Update local state
      setNote(savedNote);
      setLastSaved(new Date().toISOString());
      
      // Show saving indicator briefly
      setTimeout(() => {
        setSaving(false);
      }, 500);
    } catch (error) {
      console.error("Error saving note:", error);
      
      // Retry once after a delay on network errors
      if (error.message && (error.message.includes('network') || error.code === 'ECONNABORTED')) {
        setTimeout(async () => {
          try {
            console.log("Retrying note save after error...");
            if (noteData._id === "new") {
              const savedNote = await createNote(noteData);
              navigate(`/notes/${savedNote._id}`, { replace: true });
              setNote(savedNote);
            } else {
              const savedNote = await updateNote(noteData._id, noteData);
              setNote(savedNote);
            }
            setLastSaved(new Date().toISOString());
          } catch (retryError) {
            console.error("Retry also failed:", retryError);
            // TODO: Show error to user
          } finally {
            setSaving(false);
          }
        }, 2000);
      } else {
        setSaving(false);
        // TODO: Show error to user
      }
    }
  };

  // Toggle AI assistant panel
  const toggleAIPanel = () => {
    setShowAIPanel((prev) => !prev);
    if (showCollaborationPanel) setShowCollaborationPanel(false);
    if (showNoteFlowGPT) setShowNoteFlowGPT(false);
  };

  // Toggle NoteFlow GPT panel
  const toggleNoteFlowGPT = () => {
    setShowNoteFlowGPT((prev) => !prev);
    if (showAIPanel) setShowAIPanel(false);
    if (showCollaborationPanel) setShowCollaborationPanel(false);
  };

  // Toggle collaboration panel
  const toggleCollaborationPanel = () => {
    setShowCollaborationPanel((prev) => !prev);
    if (showAIPanel) setShowAIPanel(false);
    if (showNoteFlowGPT) setShowNoteFlowGPT(false);
  };

  // Manual save with visual feedback
  const handleManualSave = () => {
    if (!note) return;
    
    // Provide visual feedback
    setSaving(true);
    
    // Ensure we save the most current version of the note
    const currentNoteToSave = {
      ...note,
      updatedAt: new Date().toISOString()
    };
    
    // Force immediate save
    saveNote(currentNoteToSave);
  };

  // Handle folder or tag changes
  /* eslint-disable no-unused-vars */
  const handleMetadataChange = (metadataType, value) => {
    if (!note) return;
    
    setNote((prevNote) => ({
      ...prevNote,
      [metadataType]: value,
      updatedAt: new Date().toISOString(),
    }));

    // Save after a short delay
    if (contentDebounceTimeout.current) {
      clearTimeout(contentDebounceTimeout.current);
    }
    contentDebounceTimeout.current = setTimeout(() => {
      saveNote({ ...note, [metadataType]: value });
    }, 1000);
  };

  // Add a comment for ESLint to ignore the unused variable
  // Add a comment to handleAddComment to explain why it's kept
  // This function is currently unused but kept for future use or component compatibility
  const handleAddComment = (text, position) => {
    // No-op function - intentionally left empty
  };

  // Resolve a comment
  const handleResolveComment = (commentId) => {
    if (!note) return;
    
    setComments((prevComments) =>
      prevComments.map((comment) =>
        comment.id === commentId
          ? {
              ...comment,
              resolved: true,
              resolvedBy: {
                id: localStorage.getItem("userId"),
                name: localStorage.getItem("userName") || "Anonymous",
              },
              resolvedAt: new Date().toISOString(),
            }
          : comment
      )
    );

    socketService.safeEmit("resolve_comment", {
      noteId: note._id,
      commentId,
      resolvedBy: {
        id: localStorage.getItem("userId"),
        name: localStorage.getItem("userName") || "Anonymous",
      },
      resolvedAt: new Date().toISOString(),
    });
  };

  // Invite a collaborator
  const handleInviteCollaborator = (email, permissionLevel) => {
    if (!note) return;
    
    socketService.safeEmit("invite_collaborator", {
      noteId: note._id,
      email,
      permissionLevel,
    });
  };

  // Remove a collaborator
  const handleRemoveCollaborator = (userId) => {
    if (!note) return;
    
    socketService.safeEmit("remove_collaborator", {
      noteId: note._id,
      userId,
    });
  };

  const applyAISuggestion = (original, replacement) => {
    if (!note) return;

    const newContent = note.content.replace(original, replacement);
    handleContentChange(newContent);
  };

  // Add AI-generated content to note
  const addToNote = (content) => {
    if (!note) return;
    
    const newContent = `${note.content}${note.content ? '\n\n' : ''}${content}`;
    handleContentChange(newContent);
  };

  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
  };

  // Close mobile menu
  const closeMobileMenu = () => {
    setShowMobileMenu(false);
  };

  // Toggle preview mode
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  const handleImageUpload = async (event) => {
    // No-op - we'll use the editor's built-in handler
    // Forward the event to the editor's internal handler
    const editorInput = document.querySelector('.file-input');
    if (editorInput && event.target.files && event.target.files.length > 0) {
      // Create a new FileList-like object
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(event.target.files[0]);
      
      // Assign the files to the editor's input
      editorInput.files = dataTransfer.files;
      
      // Trigger change event on the editor's input
      const changeEvent = new Event('change', { bubbles: true });
      editorInput.dispatchEvent(changeEvent);
    }
  };

  // Render the appropriate content based on loading/error state
  const renderContent = () => {
    if (loading) {
      return <div className="editor-loading">Loading note...</div>;
    }

    if (error) {
      return (
        <div className="editor-error">
          <p>{error}</p>
          <button onClick={() => navigate("/dashboard")}>
            Return to Dashboard
          </button>
        </div>
      );
    }

    return (
      <div className={`editor-layout ${isMobile ? 'mobile' : ''}`}>
        {/* Editor sidebar shown only when not in mobile or when menu is open */}
        {(!isMobile || showMobileMenu) && (
          <EditorSidebar
            note={note}
            onMetadataChange={handleMetadataChange}
            onClose={closeMobileMenu}
            isMobile={isMobile}
            className={showMobileMenu ? "visible" : ""}
          />
        )}
        
        <div className="editor-main">
          {/* Different headers for desktop/mobile */}
          {isMobile ? (
            <MobileEditorHeader
              title={note?.title || "Untitled Note"}
              onTitleChange={handleTitleChange}
              onMenuToggle={toggleMobileMenu}
              onSave={handleManualSave}
              saving={saving}
              lastSaved={lastSaved}
            />
          ) : (
            <EditorHeader
              title={note?.title || "Untitled Note"}
              onTitleChange={handleTitleChange}
              toggleAIPanel={toggleAIPanel}
              toggleNoteFlowGPT={toggleNoteFlowGPT}
              toggleCollaborationPanel={toggleCollaborationPanel}
              showAIPanel={showAIPanel}
              showNoteFlowGPT={showNoteFlowGPT}
              showCollaborationPanel={showCollaborationPanel}
              onSave={handleManualSave}
              saving={saving}
              lastSaved={lastSaved}
              collaborators={note?.collaborators || []}
              activeUsers={activeUsers}
            />
          )}
          
          {/* Main editor component */}
          <div className="editor-content-wrapper" style={{ display: showPreview ? 'none' : 'flex', width: '100%' }}>
            <div className="editor-toolbar">
              <button
                className="toolbar-button"
                onClick={() => fileInputRef.current?.click()}
                title="Insert Image"
              >
                <i className="fas fa-image"></i>
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                style={{ display: 'none' }}
              />
            </div>
            
            {/* Images display area - shows above the editor */}
            <div className="embedded-images-preview" style={{ display: note?.content?.includes('![') ? 'block' : 'none' }}>
              <MarkdownPreview
                content={note?.content || ""}
                className="inline-preview"
                imagesOnly={true}
              />
            </div>
            
            <PlainTextEditor
              initialContent={note?.content || ""}
              onChange={handleContentChange}
              readOnly={false}
            />
          </div>
          
          {/* Preview rendering component */}
          <div className="editor-preview-wrapper" style={{ display: showPreview ? 'block' : 'none' }}>
            <MarkdownPreview 
              content={note?.content || ""} 
              className="editor-preview"
            />
          </div>
          
          {/* Preview toggle button */}
          <button className="preview-toggle" onClick={togglePreview} title={showPreview ? "Edit Mode" : "Preview Mode"}>
            {showPreview ? "E" : "P"}
          </button>
        </div>
        
        {/* Conditionally show panels */}
        {showAIPanel && (
          <AIAssistantPanel
            noteContent={note?.content || ""}
            onClose={toggleAIPanel}
            onSuggest={applyAISuggestion}
          />
        )}
        
        {showNoteFlowGPT && (
          <NoteFlowGPT
            noteContent={note?.content || ""}
            onClose={toggleNoteFlowGPT}
            onAddToNote={addToNote}
          />
        )}
        
        {showCollaborationPanel && (
          <CollaborationPanel
            collaborators={note?.collaborators || []}
            comments={COMMENTS}
            onAddComment={handleAddComment}
            onResolveComment={handleResolveComment}
            onInviteCollaborator={handleInviteCollaborator}
            onRemoveCollaborator={handleRemoveCollaborator}
            onClose={toggleCollaborationPanel}
          />
        )}
        
        {/* Socket connection modal */}
        {showSocketModal && (
          <NoSocketModal onRetry={() => window.location.reload()} />
        )}
      </div>
    );
  };

  return renderContent();
};

export default EditorPage;
