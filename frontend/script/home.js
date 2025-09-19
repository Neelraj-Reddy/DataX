// Fetch user data
fetch("/api/user")
  .then(res => res.json())
  .then(user => {
    document.getElementById("userName").textContent = user.name || "DataX User";
    document.getElementById("userEmail").textContent = user.email || "user@datax.com";
    document.getElementById("userRole").textContent = user.role || "Data Analyst";
    
    // Update avatar with user name seed for consistency
    const avatar = document.getElementById("userAvatar");
    if (avatar && user.name) {
      avatar.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${user.name}`;
    }
  })
  .catch(err => {
    console.error("Error fetching user:", err);
    // Set default values on error
    document.getElementById("userName").textContent = "DataX User";
    document.getElementById("userEmail").textContent = "user@datax.com";
    document.getElementById("userRole").textContent = "Data Analyst";
  });

// Fetch dashboard stats
async function loadDashboardStats() {
  try {
    // Fetch transform count
    const transformRes = await fetch("/api/transform");
    if (transformRes.ok) {
      const transforms = await transformRes.json();
      document.getElementById("transformCount").textContent = Array.isArray(transforms) ? transforms.length : 0;
    } else {
      document.getElementById("transformCount").textContent = "0";
    }
  } catch (err) {
    console.error("Error fetching transform count:", err);
    document.getElementById("transformCount").textContent = "0";
  }

  try {
    // Fetch lineage count
    const lineageRes = await fetch("/api/lineage");
    if (lineageRes.ok) {
      const lineage = await lineageRes.json();
      document.getElementById("lineageCount").textContent = Array.isArray(lineage) ? lineage.length : 0;
    } else {
      document.getElementById("lineageCount").textContent = "0";
    }
  } catch (err) {
    console.error("Error fetching lineage count:", err);
    document.getElementById("lineageCount").textContent = "0";
  }

  // Set default data source count (you can add an API endpoint for this)
  document.getElementById("dataSourceCount").textContent = "3";
}

// Initialize dashboard
loadDashboardStats();
