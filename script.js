<script>
    const slides = document.getElementById('slideContainer');
const images = document.querySelectorAll('.slides img');
let index = 0;
const totalImages = images.length;

function showNextSlide() {
    index++;
    
    // Smooth transition on rakhein
    slides.style.transition = "transform 0.5s ease-in-out";
    slides.style.transform = `translateX(${-index * 100}%)`;

    // Jab aakhri (copy) image khatam ho jaye
    if (index === totalImages - 1) {
        setTimeout(() => {
            // Animation band karke turant index 0 par jayein
            slides.style.transition = "none";
            index = 0;
            slides.style.transform = `translateX(0%)`;
        }, 500); // 500ms transition time ke baad reset hoga
    }
}

setInterval(showNextSlide, 3000);


</script>


  
    <footer class="main-footer" id="ft">
        <div class="footer-column">

             <h3>Privacy Policy</h3>
            <a style="color: #eee;" href="privacypolicy.html">Privacy Policy</a>
              <h3>Other Connection</h3>
            <a style="color: #eee;text-decoration: none;" href="https://tsedio73-source.github.io/cdmilk/" >CD Milk Web</a> <br>
 <a style="color: #eee;text-decoration: none;" href="https://upload.app/download/my-school/com.mycomapny.mywebapp9p/8939c58145c78d7dfb87e3439c12736eabeeed74c2887fd8fe42285cfc1d54c0" >School Data APK Download</a> <br>
<a style="color: #eee;text-decoration: none;"  href="https://upload.app/download/tourist/com.mycomapny.mywebapptourist/8a12b0d8750d621868b5801e5a04e44e3dd575d246d83ab86aa62d46a079b41e" >Tourist Manager APK Download</a> <br>
<a style="color: #eee;text-decoration: none;" href="https://upload.app/download/cd-milk/com.mycomapny.mywebapp0/024b4e0964665add51e1cd3aa27439edffe5f89d4f219afa177f6237a9ef8f0c" >CD Milk APK Download</a>

                        

            <h3>Contact us</h3>
            <p>Address: Hirauli Kutubnagar, Shahabad Hardoi</p>
            <p>Email: info@hirauliwebsite.com</p>
        </div>
     <div class="footer-column">
      <h3>Connect</h3>
            <div class="social-icons">
                <a href="https://www.facebook.com/share/188s4tq2FZ/"><i class="fab fa-facebook"></i></a>
                <a href="https://www.instagram.com/rajput_hsihsa?igsh=MWF6bng1azl3amdhZA=="><i class="fab fa-instagram"></i></a>
                <a href="https://x.com/AshishR29942459"><i class="fab fa-twitter"></i></a>
            </div>
        </div>
        
        <div style="text-align:center; padding-top:20px; border-top:1px solid #444;">
 <p>&reg; <script>document.write(new Date().getFullYear()) </script> Powered by Tsedio</p>
        </div>
    </footer>
    


    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

        const firebaseConfig = {
            apiKey: "AIzaSyArtybAAgMFeLv1K9b_0GhSh66oYWuDLco",
            authDomain: "news-82329.firebaseapp.com",
            projectId: "news-82329",
            storageBucket: "news-82329.firebasestorage.app",
            messagingSenderId: "29851688400",
            appId: "1:29851688400:web:7a9c17b2bf758ca76aadd5"
        };

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const provider = new GoogleAuthProvider();

        // Global functions
        window.login = async () => {
            try { await signInWithPopup(auth, provider); } 
            catch (error) { alert("Login failed: " + error.message); }
        };

        window.logout = () => signOut(auth);

        window.protectedRoute = (path) => {
            if (auth.currentUser) { location.href = path; } 
            else { alert("First Please Login before use of Add feature!"); toggleMenu(); }
        };

        onAuthStateChanged(auth, (user) => {
            const loginBtn = document.getElementById('login-btn-sidebar');
            const logoutBtn = document.getElementById('logout-btn');
            const userImg = document.getElementById('user-img');
            const userName = document.getElementById('user-name');
            const marquee = document.getElementById("adv");

            if (user) {
                marquee.style.display = "none";
                loginBtn.style.display = 'none';

                logoutBtn.style.display = 'block';
                userImg.src = user.photoURL;
                userImg.style.display = 'block';
                userName.innerText = user.displayName;
            } else {
                loginBtn.style.display = 'flex';
                logoutBtn.style.display = 'none';
                userImg.style.display = 'none';
                userName.innerText = '';
            }
        });
    </script>

    <script>
        function toggleMenu() {
            const nav = document.getElementById("navMenu");
            const overlay = document.getElementById("overlay");
            if (nav.style.left === "0px") {
                nav.style.left = "-260px";
                overlay.style.display = "none";
            } else {
                nav.style.left = "0px";
                overlay.style.display = "block";
            }
        }
    </script>
   <script type="module">

import { initializeApp } from 
'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';

import { getDatabase, ref, onValue } from 
'https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js';


const firebaseConfig = {
    apiKey: "AIzaSyD2eitt5iTwBaTx8CWeuuPeyD7nTa58XD8",
    authDomain: "freefollowers-d31af.firebaseapp.com",
    databaseURL: "https://freefollowers-d31af-default-rtdb.firebaseio.com",
    projectId: "freefollowers-d31af",
    storageBucket: "freefollowers-d31af.firebasestorage.app",
    messagingSenderId: "807949104285",
    appId: "1:807949104285:web:134fe5eef8304ec4279074"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const bannersRef = ref(db, 'banners');

onValue(bannersRef, (snapshot) => {

    const data = snapshot.val();
    if (!data) return;

    const placeholder =
    "https://via.placeholder.com/400x200/ddd?text=No+Image";

    /* ======================
       NEW SECTION (5 banners)
    ====================== */

    for(let i = 1; i <= 5; i++) {

        const img = document.getElementById(`new${i}`);

        if(img){
            img.src =
            data[`banner${i}`]?.image || placeholder;
        }
    }

    /* ===== MAIN ===== */
    const main = document.getElementById('main');
    if(main){
        main.src = data.banner6?.image || placeholder;
    }

    /* ===== FOOTER ===== */
    const foot = document.getElementById('footb');
    if(foot){
        foot.src = data.banner7?.image || placeholder;
    }

});

</script>
