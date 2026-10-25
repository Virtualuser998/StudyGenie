import { useRef, useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import "../styles/studyMaterials.css";


function StudyMaterials() {

  const fileInputRef = useRef(null);
  const [materials, setMaterials] = useState([]);
  const [subject, setSubject] = useState("General");
  // =====================================
  // OPEN FILE PICKER
  // =====================================

  const openFilePicker = () => {
    fileInputRef.current.click();
  };

  // =====================================
  // FETCH MATERIALS FROM MONGODB
  // =====================================

  const fetchMaterials = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return;
      }

      const response = await axios.get(
        "/api/materials",
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setMaterials(response.data);

      console.log(
        "Fetched Materials:",
        response.data
      );

    } catch (error) {

      console.error(
        "Fetch Materials Error:",
        error
      );

    }

  };


  // =====================================
  // LOAD MATERIALS WHEN PAGE OPENS
  // =====================================

  useEffect(() => {

    fetchMaterials();

  }, []);


  // =====================================
  // UPLOAD MATERIAL
  // =====================================

  const handleFileChange = async (e) => {

    const file = e.target.files[0];

    if (!file) {
      return;
    }


    try {

      const token = localStorage.getItem("token");

      if (!token) {

        alert("Please login first.");

        return;

      }


      const formData = new FormData();

      formData.append(
        "file",
        file
      );
      formData.append(
  "subject",
  subject
);
     
      const response = await axios.post(
        "/api/materials/upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );


      console.log(
        "Uploaded Material:",
        response.data
      );


      alert(
        "Study material uploaded successfully!"
      );


      // Refresh list after upload
      fetchMaterials();


      // Allows same file to be selected again
      e.target.value = "";


    } catch (error) {
      console.error( "Upload Error:", error);
      alert(  error.response?.data?.message ||  "File upload failed" );

    }

  };

  // =====================================
  // DOWNLOAD MATERIAL
  // =====================================

  const handleDownload = async (material) => {

    try {

      const token = localStorage.getItem("token");


      if (!token) {

        alert("Please login first.");

        return;

      }


      const response = await axios.get(
        `/api/materials/${material._id}/download`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          },

          responseType: "blob"
        }
      );


      const url =
        window.URL.createObjectURL(
          new Blob([response.data])
        );

      const link =
        document.createElement("a");

      link.href = url;

      link.setAttribute(
        "download",
        material.originalName
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Download Error:",
        error
      );

      alert(
        "File download failed"
      );
    }
  };
  const handleDelete = async (material) => {
  const confirmDelete = window.confirm(
    `Are you sure you want to delete "${material.originalName}"?`
  );

  if (!confirmDelete) {
    return;
  }

  try {

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login first.");
      return;
    }

    const response = await axios.delete(
      `/api/materials/${material._id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );

    alert(
      response.data.message ||
      "Material deleted successfully"
    );

    fetchMaterials();

  } catch (error) {

    console.error(
      "Delete Error:",
      error
    );

    alert(
      error.response?.data?.message ||
      "Failed to delete material"
    );

  }
};
  // =====================================
  // FORMAT FILE SIZE
  // =====================================

  const formatFileSize = (size) => {
    if (size >= 1024 * 1024) {
      return `${(
        size /
        (1024 * 1024)
      ).toFixed(2)} MB`;

    }

    return `${(
      size / 1024
    ).toFixed(2)} KB`;
  };

  // =====================================
  // PAGE UI
  // =====================================
  return (
    <div className="dashboardLayout">
      <Sidebar />
      <main className="dashboardMain">
        <Topbar />

        {/* =============================
            PAGE HEADER
        ============================== */}

        <section className="materialsHeader">


          <div>

            <h1>
              Study Materials
            </h1>

            <p>
              Upload, organize and manage all your
              study materials in one place.
            </p>

          </div>


          <div>

            <button
              className="uploadTopBtn"
              onClick={openFilePicker}
            >
              + Upload Material
            </button>


            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
              hidden
            />

          </div>


        </section>


        {/* =============================
            UPLOAD / TIPS / STORAGE
        ============================== */}

        <section className="materialsTopGrid">


          {/* UPLOAD CARD */}

          <div className="uploadCard">
            <div className="uploadIcon"> ☁️ </div>
            <h2> Upload Study Material </h2>
            <p> Drag & drop your file here or click below to browse. </p>

<div className="uploadSubject">

  <label>
    Select Subject
  </label>

  <select
    value={subject}
    onChange={(e) =>
      setSubject(e.target.value)
    }
  >

    <option value="General">
      General
    </option>

    <option value="Data Structures">
      Data Structures
    </option>

    <option value="DBMS">
      DBMS
    </option>

    <option value="Operating Systems">
      Operating Systems
    </option>

    <option value="Computer Networks">
      Computer Networks
    </option>
    <option value="Java"> Java </option>
    <option value="Mathematics"> Mathematics </option>

  </select>

</div>
            <button
              className="browseBtn"
              onClick={openFilePicker}
            >
              Browse Files
            </button>


            <span className="uploadSupport">
              Supports PDF, DOCX, PPTX, TXT • Max 20MB
            </span>

          </div>



          {/* UPLOAD TIPS */}

          <div className="materialsInfoCard">

            <h3>
              💡 Upload Tips
            </h3>


            <ul>

              <li>
                Use clear and readable documents.
              </li>

              <li>
                Keep file size below 20MB.
              </li>

              <li>
                Use proper subject names.
              </li>

              <li>
                PDF format works best for AI notes.
              </li>

            </ul>

          </div>



          {/* STORAGE */}

          <div className="materialsInfoCard">

            <h3>
              Storage Usage
            </h3>


            <div className="storageText">

              <span>
                4.2 GB used
              </span>

              <strong>
                42%
              </strong>

            </div>


            <div className="storageBar">

              <div className="storageFill">
              </div>

            </div>


            <p>
              4.2 GB of 10 GB storage used
            </p>

          </div>


        </section>


        {/* =============================
            MAIN MATERIAL SECTION
        ============================== */}

        <section className="materialsContent">


          {/* MATERIAL LIST */}

          <div className="materialsListCard">


            <div className="materialsListHeader">


              <div>

                <h2>
                  My Materials
                </h2>

                <p>
                  Manage your uploaded study files.
                </p>

              </div>


              <div className="materialsActions">

                <select>

                  <option>
                    Recently Added
                  </option>

                  <option>
                    Name A-Z
                  </option>

                  <option>
                    Oldest First
                  </option>

                </select>


                <button>
                  ☷
                </button>


                <button>
                  ▦
                </button>

              </div>


            </div>



            {/* =============================
                REAL MONGODB MATERIALS
            ============================== */}

            {materials.length > 0 ? (

              materials.map((material) => (

                <MaterialRow

                  key={material._id}

                  icon="📄"

                  name={ material.originalName  }
                  subject={ material.subject }
                  size={  formatFileSize( material.fileSize  ) }
                  date={ new Date( material.createdAt).toLocaleDateString() }
                  material={material}
                  onDownload={ handleDownload }
                  onDelete={handleDelete}
                />

              ))

            ) : (

              <div className="noMaterials">

                <p>
                  No study materials uploaded yet.
                </p>

              </div>

            )}



            {/* PAGINATION */}

            <div className="pagination">

              <button>
                ←
              </button>

              <button className="activePage">
                1
              </button>

              <button>
                2
              </button>

              <button>
                3
              </button>

              <button>
                →
              </button>

            </div>


          </div>



          {/* =============================
              RIGHT SIDE
          ============================== */}

          <aside className="materialsRight">


            {/* FILTER */}

            <div className="filterCard">

              <h3>
                Filter Materials
              </h3>


              <input
                type="text"
                placeholder="Search materials..."
              />


              <label>
                Subject
              </label>


              <select>

                <option>
                  All Subjects
                </option>

                <option>
                  Data Structures
                </option>

                <option>
                  DBMS
                </option>

                <option>
                  Operating Systems
                </option>

                <option>
                  Computer Networks
                </option>

              </select>


              <label>
                File Type
              </label>


              <select>

                <option>
                  All Types
                </option>

                <option>
                  PDF
                </option>

                <option>
                  DOCX
                </option>

                <option>
                  PPTX
                </option>

                <option>
                  TXT
                </option>

              </select>


              <label>
                Date Added
              </label>


              <select>

                <option>
                  Any Time
                </option>

                <option>
                  Today
                </option>

                <option>
                  This Week
                </option>

                <option>
                  This Month
                </option>

              </select>


              <button className="applyFilterBtn">

                Apply Filters

              </button>


            </div>



            {/* SUBJECTS */}

            <div className="subjectsCard">

              <h3>
                Subjects
              </h3>


              <SubjectItem
                name="Data Structures"
                count="6"
              />


              <SubjectItem
                name="DBMS"
                count="5"
              />


              <SubjectItem
                name="Operating Systems"
                count="4"
              />


              <SubjectItem
                name="Computer Networks"
                count="4"
              />


              <SubjectItem
                name="Java"
                count="3"
              />


              <SubjectItem
                name="Mathematics"
                count="2"
              />


            </div>


          </aside>


        </section>


      </main>


    </div>

  );

}



// =====================================
// MATERIAL ROW COMPONENT
// =====================================

function MaterialRow({
  icon,
  name,
  subject,
  size,
  date,
  material,
  onDownload,
  onDelete
}) {

  return (

    <div className="materialRow">


      <div className="materialFileIcon">

        {icon}

      </div>



      <div className="materialName">

        <h4>
          {name}
        </h4>

        <p>
          {subject}
        </p>

      </div>



      <span className="materialSize">

        {size}

      </span>



      <span className="materialDate">

        {date}

      </span>



      <button
        className="downloadBtn"
        onClick={() =>
          onDownload(material)
        }
        title="Download"
      >

        ⬇

      </button>

<button
  className="menuBtn"
  onClick={() => onDelete(material)}
  title="Delete Material"
> 🗑️
</button>
    </div>
  );

}



// =====================================
// SUBJECT ITEM COMPONENT
// =====================================

function SubjectItem({
  name,
  count
}) {

  return (

    <div className="subjectItem">

      <span>
        {name}
      </span>

      <strong>
        {count}
      </strong>

    </div>

  );

}

export default StudyMaterials;