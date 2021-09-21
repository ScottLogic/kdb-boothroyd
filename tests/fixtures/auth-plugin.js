function parse(server) {
  const bits = `${server.port}`.split("");
  const reversed = parseInt(bits.reverse().join(""));
  console.log("REVERSED", reversed);
  server.port = reversed;
  return server;
}

server = parse(server);
