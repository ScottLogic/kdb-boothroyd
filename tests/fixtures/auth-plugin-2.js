function parse(server) {
  const bits = `${server.name}`.split("");
  const limit = "z".charCodeAt(0);
  const start = "a".charCodeAt(0);

  const encrypted = bits.map((c) => {
    let ascii = c.charCodeAt(0);
    ascii += 2;

    if (ascii > limit) ascii = start + (ascii - limit);

    return String.fromCharCode(ascii);
  });

  server.name = encrypted.join("");
  return server;
}

server = parse(server);
