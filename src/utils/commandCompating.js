module.exports = (existingCommand, localCommand) => {
  const {
    name: existingName,
    description: existingDescription,
    options: existingOptions = [],
  } = existingCommand;
  const {
    data: {
      name: localName,
      description: localDescription,
      options: localOptions = [],
    },
  } = localCommand;

  const hasDiff = (a, b) => JSON.stringify(a) !== JSON.stringify(b);

  const checkOpts = (existingOpts, localOpts) => {
    return localOpts.some((localOpt) => {
      const existingOpt = existingOpts.find(
        (opt) => opt.name === localOpt.name
      );
      if (existingOpt) return true;
      return hasDiff(localOpt, existingOpt);
    });
  };

  if (
    existingName !== localName ||
    existingDescription !== localDescription ||
    checkOpts(existingOptions, localOptions)
  )
    return true;
};
