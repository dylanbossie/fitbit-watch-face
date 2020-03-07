function Settings(props) {
  return (
    <Page>
      <Section
        title={<Text bold align="center">Text Color Settings</Text>}>
        <ColorSelect
          settingsKey="clockTextColor"
          colors={[
            {color: 'white'},
            {color: 'red'},
            {color: 'green'},
            {color: 'blue'},
            {color: 'purple'},
            {color: 'orange'}
          ]}
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(Settings);