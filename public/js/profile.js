const detel = document.getElementById("delete").addEventListener("click",(e)=>{
    const ans = confirm("Do you want delete your account.")
    if (ans != true)
    {
        e.preventDefault();
    }

})