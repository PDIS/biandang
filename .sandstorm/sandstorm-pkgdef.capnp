@0x8ac743036a154646;

using Spk = import "/sandstorm/package.capnp";
# This imports:
#   $SANDSTORM_HOME/latest/usr/include/sandstorm/package.capnp
# Check out that file to see the full, documented package definition format.

const pkgdef :Spk.PackageDefinition = (
  # The package definition. Note that the spk tool looks specifically for the
  # "pkgdef" constant.

  id = "c70m9m4z44k26kr3z1f18ckt90rugtmcsdw0shf9m041usgrvufh",
  # Your app ID is actually its public key. The private key was placed in
  # your keyring. All updates must be signed with the same key.

  manifest = (
    # This manifest is included in your app package to tell Sandstorm
    # about your app.

    appVersion = 201708032,  # Increment this for every release.
    appTitle = (defaultText = "Biandang"),
    appMarketingVersion = (defaultText = "2017.08.03.2"),

    actions = [
      # Define your "new document" handlers here.
      ( title = (defaultText = "新菜單"),
        nounPhrase = (defaultText = "菜單"),
        command = .myContinueCommand
        # The command to run when starting for the first time. (".myCommand"
        # is just a constant defined at the bottom of the file.)
      )
    ],

    continueCommand = .myContinueCommand,
    # This is the command called to start your app back up after it has been
    # shut down for inactivity. Here we're using the same command as for
    # starting a new instance, but you could use different commands for each
    # case.



    metadata = (
      icons = (
        appGrid = (png = (dpi1x = embed "app-graphics/biandang-128.png")),
        grain = (png = (dpi1x = embed "app-graphics/biandang-32.png",
                              dpi2x = embed "app-graphics/biandang-48.png")),
        market = (png = (dpi1x = embed "app-graphics/biandang-128.png")),
      ),

      website = "https://github.com/PDIS/biandang",
      codeUrl = "https://github.com/PDIS/biandang",
      license = (openSource = apache2),
      categories = [office],

      author = (
        contactEmail = "urakagi@gmail.com",
        pgpSignature = embed "pgp-signature",
      ),
      pgpKeyring = embed "pgp-keyring",

      description = (defaultText = embed "DESCRIPTION.mkdn"),
      shortDescription = (defaultText = "Form app for ordering lunch boxes"),

      # screenshots = [
      #   (width = 478, height = 298, png = embed "../static/img/davy/gfx/screenshot.png")
      # ],

      changeLog = (defaultText = embed "CHANGELOG.mkdn"),
    ),
  ),

  sourceMap = (
    # Here we defined where to look for files to copy into your package. The
    # `spk dev` command actually figures out what files your app needs
    # automatically by running it on a FUSE filesystem. So, the mappings
    # here are only to tell it where to find files that the app wants.
    searchPath = [
      ( sourcePath = "." ),  # Search this directory first.
      ( sourcePath = "/",    # Then search the system root directory.
        hidePaths = [ "home", "proc", "sys" ]
        # You probably don't want the app pulling files from these places,
        # so we hide them. Note that /dev, /var, and /tmp are implicitly
        # hidden because Sandstorm itself provides them.
      )
    ]
  ),

  fileList = "sandstorm-files.list",
  # `spk dev` will write a list of all the files your app uses to this file.
  # You should review it later, before shipping your app.

  alwaysInclude = [],
  # Fill this list with more names of files or directories that should be
  # included in your package, even if not listed in sandstorm-files.list.
  # Use this to force-include stuff that you know you need but which may
  # not have been detected as a dependency during `spk dev`. If you list
  # a directory here, its entire contents will be included recursively.

  bridgeConfig = (
    viewInfo = (
      permissions = [(name = "modify", title = (defaultText = "modify"),
                      description = (defaultText = "allows modifying the spreadsheet"))],
      roles = [(title = (defaultText = "editor"),
                permissions = [true],
                verbPhrase = (defaultText = "can edit"),
                default = true),
               (title = (defaultText = "viewer"),
                permissions = [false],
                verbPhrase = (defaultText = "can view"))]
    )
  )
);

const myContinueCommand :Spk.Manifest.Command = (
  # Here we define the command used to start up your server.
  argv = ["/sandstorm-http-bridge", "3000", "--", "/opt/app/.sandstorm/launcher.sh"],
  environ = [
    # Note that this defines the *entire* environment seen by your app.
    (key = "PATH", value = "/usr/local/bin:/usr/bin:/bin"),
    (key = "HOME", value = "/home/vagrant")
  ]
);
