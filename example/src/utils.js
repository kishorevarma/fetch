export const getToken = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return token;
  } else {
    const token = Math.random()
      .toString(32)
      .substr(0, 6);
    localStorage.setItem("token", token);
    return token;
  }
};

export const api = "https://contacts.now.sh";
