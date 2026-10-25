import { useState, useEffect ,useRef } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";

import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

import "../styles/aiNotes.css";


function AINotes() {

  // =====================================
  // STATES
  // =====================================

  const [activeTab, setActiveTab] = useState("upload");
  const [noteType, setNoteType] = useState("Summary");
  const [pastedText, setPastedText] = useState("");
  const [generatedNotes, setGeneratedNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentNotes, setRecentNotes] = useState([]);
  const [showAllNotes, setShowAllNotes] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const aiFileInputRef = useRef(null);

// =====================================
// OPEN AI FILE PICKER
// =====================================

const openAIFilePicker = () => {
  aiFileInputRef.current.click();
};

// =====================================
// UPLOAD AND EXTRACT STUDY FILE
// =====================================

const handleAIFileChange = async (e) => {

  const file =
    e.target.files[0];


  if (!file) {
    return;
  }


  // Supported file extensions

  const extension =
    file.name
      .split(".")
      .pop()
      .toLowerCase();


  const allowedExtensions = [
    "txt",
    "pdf",
    "docx"
  ];


  if (
    !allowedExtensions.includes(
      extension
    )
  ) {

    alert(
      "Please upload PDF, DOCX or TXT file."
    );

    e.target.value = "";

    return;
  }


  // Maximum 20 MB

  if (
    file.size >
    20 * 1024 * 1024
  ) {

    alert(
      "File size must be less than 20 MB."
    );

    e.target.value = "";

    return;
  }


  try {

    setLoading(true);


    const token =
      localStorage.getItem("token");


    if (!token) {

      alert("Please login first.");

      return;
    }


    const formData =
      new FormData();


    formData.append(
      "file",
      file
    );


    const response =
      await axios.post(

        "/api/ai/extract-file",

        formData,

        {
          headers: {

            Authorization:
              `Bearer ${token}`

          }
        }

      );


    // Store selected file

    setSelectedFile(file);


    // Extracted text goes into pastedText

    setPastedText(
      response.data.text
    );


    alert(
      `${file.name} loaded successfully!`
    );


  } catch (error) {

    console.error(
      "AI File Upload Error:",
      error
    );


    alert(
      error.response?.data?.message ||
      "Failed to read file"
    );

    setSelectedFile(null);
    setPastedText("");

  } finally {
    setLoading(false);
    e.target.value = "";
  }

};
  
  // =====================================
  // FETCH RECENT NOTES FROM MONGODB
  // =====================================
  const fetchRecentNotes = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }
      const response = await axios.get(
        "/api/ai/notes",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setRecentNotes(response.data);

      console.log(
        "Recent AI Notes:",
        response.data
      );

    } catch (error) {

      console.error(
        "Fetch Recent Notes Error:",
        error
      );

    }

  };


  // =====================================
  // LOAD RECENT NOTES WHEN PAGE OPENS
  // =====================================

  useEffect(() => {
    fetchRecentNotes();
  }, []);


  // =====================================
  // GENERATE NOTES
  // =====================================
     const handleGenerateNotes = async () => {
     if (activeTab === "youtube") {
       alert(
         "YouTube support will be added later."
         );
         return;
    }
    if (!pastedText.trim()) {
      alert(
        "Please paste some study content first."
      );
      return;
    }
    try {

      setLoading(true);

      const token =
        localStorage.getItem("token");

      if (!token) {

        alert("Please login first.");

        return;
      }


      const response = await axios.post(
        "/api/ai/generate-notes",
        
     {
  text: pastedText,
  noteType: noteType,

  sourceType:
    activeTab === "upload"
      ? "file"
      : "text"
} ,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      setGeneratedNotes(
        response.data.notes
      );


      // Refresh Recent Generations
      // because backend already saves the note
      await fetchRecentNotes();

    } catch (error) {

      console.error(
        "Generate Notes Error:",
        error
      );


      alert(
        error.response?.data?.message ||
        "Failed to generate notes"
      );


    } finally {

      setLoading(false);

    }

  };


  // =====================================
  // DOWNLOAD GENERATED NOTES
  // =====================================

  const handleDownloadNotes = () => {

    if (!generatedNotes) {

      alert(
        "No notes available to download."
      );

      return;
    }


    const content = `
StudyGenie AI
${noteType}

${generatedNotes}
    `;


    const blob = new Blob(
      [content],
      {
        type: "text/plain"
      }
    );


    const url =
      window.URL.createObjectURL(blob);


    const link =
      document.createElement("a");


    link.href = url;


    link.download =
      `StudyGenie-${noteType.replaceAll(
        " ",
        "-"
      )}.txt`;


    document.body.appendChild(link);

    link.click();

    link.remove();


    window.URL.revokeObjectURL(url);

  };


  // =====================================
  // REGENERATE NOTES
  // =====================================

  const handleRegenerate = () => {

    if (!pastedText.trim()) {

      alert(
        "No study content available."
      );

      return;
    }


    handleGenerateNotes();

  };
  // =====================================
  // COPY NOTES
  // =====================================

  const handleCopyNotes = async () => {

    if (!generatedNotes) {
      return;
    }


    try {

      await navigator.clipboard.writeText(
        generatedNotes
      );

      alert("Notes copied!");


    } catch (error) {

      console.error(
        "Copy Error:",
        error
      );

      alert(
        "Unable to copy notes."
      );

    }

  };
  // =====================================
  // PAGE UI
  // =====================================
const handleOpenRecentNote = (note) => {

  setGeneratedNotes(
    note.generatedNotes
  );

  setNoteType(note.noteType || "Summary");
  setPastedText(note.sourceText || "");
  setActiveTab("text");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
};
const handleDeleteRecentNote = async (note) => {

  const confirmDelete =
    window.confirm(
      `Delete "${note.title}"?`
    );


  if (!confirmDelete) {
    return;
  }


  try {

    const token =
      localStorage.getItem("token");


    if (!token) {

      alert("Please login first.");

      return;

    }


    const response =
      await axios.delete(
        `/api/ai/notes/${note._id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`
          }
        }
      );


    alert(
      response.data.message
    );


    // Agar currently opened note delete hua
    // to generated section clear kar do.

    if (
      generatedNotes ===
      note.generatedNotes
    ) {

      setGeneratedNotes("");

    }


    // Refresh history
    fetchRecentNotes();


  } catch (error) {

    console.error(
      "Delete AI Note Error:",
      error
    );


    alert(
      error.response?.data?.message ||
      "Failed to delete AI note"
    );

  }

};
  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="dashboardMain">
        <Topbar />
        {/* =================================
            PAGE HEADER
        ================================= */}

        <section className="aiNotesHeader">
          <div>
            <h1> AI Notes & Summary </h1>
            <p>
              Generate smart notes, summaries and
              key points from your study materials.
            </p>
          </div>
        </section>

        {/* =================================
            MAIN AREA
        ================================= */}

        <section className="aiNotesMainGrid">


          {/* LEFT SIDE */}

          <div className="aiNotesLeft">


            {/* =================================
                GENERATE NOTES CARD
            ================================= */}

            <div className="aiNotesCard">


              <div className="aiNotesCardHeader">

                <div>

                  <h2>
                    ✨ Generate Notes / Summary
                  </h2>

                  <p>
                    Choose your study material and
                    let AI generate useful notes.
                  </p>

                </div>

              </div>



              {/* =================================
                  TABS
              ================================= */}

              <div className="aiNotesTabs">


                <button
                  className={
                    activeTab === "upload"
                      ? "activeAiTab"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("upload")
                  }
                >
                  📁 Upload File
                </button>


                <button
                  className={
                    activeTab === "text"
                      ? "activeAiTab"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("text")
                  }
                >
                  📝 Paste Text
                </button>


                <button
                  className={
                    activeTab === "youtube"
                      ? "activeAiTab"
                      : ""
                  }
                  onClick={() =>
                    setActiveTab("youtube")
                  }
                >
                  ▶ YouTube Link
                </button>


              </div>



              {/* =================================
                  UPLOAD TAB
              ================================= */}
             {activeTab === "upload" && (

  <div className="aiUploadBox">

    <div className="aiUploadIcon">
      ☁️
    </div>

    <h3>
      Upload Study Material
    </h3>

    <p>
      Upload your study material and
      generate AI notes from its content.
    </p>

    <button
      className="aiBrowseBtn"
      onClick={openAIFilePicker}
      disabled={loading}
    >
      {loading
      ? "⏳ Reading File..."
      : "Browse File"}
    </button>


    <input
      type="file"
      ref={aiFileInputRef}
      onChange={handleAIFileChange}
        accept=".pdf,.docx,.txt"
      hidden
    />


    {selectedFile && (
      <div className="selectedAiFile">
        📄 {selectedFile.name}
      </div>
    )}

    <span> Supports PDF, DOCX and TXT • Maximum 20 MB</span>
  </div>

)}




              {/* =================================
                  PASTE TEXT TAB
              ================================= */}

              {activeTab === "text" && (

                <div className="pasteTextBox">

                  <label>
                    Paste Your Study Content
                  </label>

                  <textarea
                    placeholder="Paste your notes, chapter or study content here..."
                    rows="9"
                    value={pastedText}
                    onChange={(e) =>
                      setPastedText(
                        e.target.value
                      )
                    }
                  ></textarea>

                </div>

              )}



              {/* =================================
                  YOUTUBE TAB
              ================================= */}

              {activeTab === "youtube" && (

                <div className="youtubeInputBox">

                  <label>
                    YouTube Video Link
                  </label>

                  <input
                    type="text"
                    placeholder="https://youtube.com/watch?v=..."
                  />

                  <p>
                    Paste an educational YouTube
                    video link to generate study notes.
                  </p>

                </div>

              )}



              {/* =================================
                  AI OPTIONS
              ================================= */}

              <div className="aiOptions">


                <div className="aiOptionGroup">

                  <label>
                    AI Model
                  </label>

                  <select>

                    <option>
                      StudyGenie AI (Fast & Accurate)
                    </option>

                    <option>
                      Google Gemini
                    </option>

                  </select>

                </div>



                <div className="aiOptionGroup">

                  <label>
                    Note Type
                  </label>

                  <select
                    value={noteType}
                    onChange={(e) =>
                      setNoteType(
                        e.target.value
                      )
                    }
                  >

                    <option value="Summary">
                      Summary
                    </option>

                    <option value="Detailed Notes">
                      Detailed Notes
                    </option>

                    <option value="Key Points">
                      Key Points
                    </option>

                    <option value="Mind Map">
                      Mind Map
                    </option>

                  </select>

                </div>


              </div>



              {/* =================================
                  GENERATE BUTTON
              ================================= */}

              <button
                className="generateNotesBtn"
                onClick={handleGenerateNotes}
                disabled={loading}
              >

                {
                  loading
                    ? "⏳ Generating Notes..."
                    : "✨ Generate Notes"
                }

              </button>


            </div>



            {/* =================================
                REAL GENERATED NOTES
            ================================= */}

            {generatedNotes && (

              <div className="aiNotesCard generatedNotesCard">


                <div className="generatedHeader">


                  <div>

                    <span className="generatedBadge">
                      AI Generated
                    </span>

                    <h2>
                      {noteType}
                    </h2>

                    <p>
                      Generated by StudyGenie AI
                    </p>

                  </div>



                  <div className="generatedActions">


                    <button
                      onClick={handleCopyNotes}
                    >
                      📋 Copy
                    </button>


                    <button
                      onClick={handleDownloadNotes}
                    >
                      ⬇ Download
                    </button>


                    <button
                      onClick={handleRegenerate}
                      disabled={loading}
                    >

                      {
                        loading
                          ? "⏳ Generating..."
                          : "🔄 Regenerate"
                      }

                    </button>


                  </div>


                </div>



                {/* MARKDOWN OUTPUT */}

                <div className="generatedContent">

                  <div className="generatedAiText">

                    <ReactMarkdown>
                      {generatedNotes}
                    </ReactMarkdown>

                  </div>

                </div>


              </div>

            )}



          </div>



          {/* =================================
              RIGHT SIDE
          ================================= */}

          <aside className="aiNotesRight">


            {/* =================================
                RECENT GENERATIONS
            ================================= */}

            <div className="aiNotesCard">


              <div className="sideCardHeader">

                <h3>
                  Recent Generations
                </h3>
              <button
                onClick={() =>
                  setShowAllNotes(!showAllNotes)
                }
              >
            {showAllNotes
            ? "Show Less"
            : "View All"}
            </button>
       
              </div>
              {/* REAL MONGODB HISTORY */}
              {recentNotes.length > 0 ? (

               (showAllNotes
                 ? recentNotes
                 : recentNotes.slice(0, 4)
               ).map((note) => (

                <RecentNote
                  key={note._id}
                  icon="📝"
                  title={note.title}
                  subject={note.noteType}
                  time={
                    new Date(
                      note.createdAt
                    ).toLocaleDateString()
                  }
                  note={note}
                  onOpen={handleOpenRecentNote}
                  onDelete={handleDeleteRecentNote}
                 /> 
            
                  ))

              ) : (

                <p className="noRecentNotes">
                  No AI notes generated yet.
                </p>

              )}


            </div>



            {/* =================================
                QUICK TIPS
            ================================= */}

            <div className="aiNotesCard tipsCard">

              <h3>
                💡 AI Notes Tips
              </h3>

              <ul>

                <li>
                  Upload clear and readable files.
                </li>

                <li>
                  Select the right note type.
                </li>

                <li>
                  Use summaries for quick revision.
                </li>

                <li>
                  Use detailed notes for exam preparation.
                </li>

              </ul>

            </div>


          </aside>


        </section>


      </main>


    </div>

  );

}



// =====================================
// RECENT NOTE COMPONENT
// =====================================

function RecentNote({
  icon,
  title,
  subject,
  time,
  note,
  onOpen,
  onDelete
}) {

  return (

    <div className="recentNoteItem">
      <div className="recentNoteIcon">
        {icon}
      </div>

      <div className="recentNoteText">
        <h4> {title} </h4>
        <p>{subject}</p>
        <span>{time} </span>
      </div>

      <div className="recentNoteActions">

  <button
    title="Open Note"
    onClick={() =>
      onOpen(note)
    }
  >
    →
  </button>

  <button
    title="Delete Note"
    onClick={() =>
      onDelete(note)
    }
  >
    🗑️
  </button>

</div>
    </div>
  );
}
export default AINotes;