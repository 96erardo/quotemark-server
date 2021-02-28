function greetings (name: string): string {
  return `Hello ${name}`;
}

console.log(greetings('John Doe'));

console.log(process.env.NODE_ENV)