import {
  Card, BlockStack, Text, Box, InlineStack, Button, Badge, Tabs, TextField,
} from '@shopify/polaris';
import {useCallback, useState} from 'react';
export function TabContent({tab,...props}) {

  return tab.sections.map( (section,key) => ( <Section section={section} key={key} {...props} />))
}


const Section = ({section,...props}) => {
  return (
    <Card sectioned>
      <BlockStack gap={400}>
        <BlockStack>
          <Text variant="headingLg" as="h5">
            {section.title}
          </Text>
          { section.subTitle && <Text tone="subdued" as="p"> {section.subTitle } </Text> }
        </BlockStack>
        { section.options?.map( (option, key) => (<Option option={option} key={key} {...props} />) ) }
      </BlockStack>
    </Card>
  )
}


const Option = ({option,shortSetSettings}) => {
  const changeOption = (newValue, optionName = null) => {
    shortSetSettings({[optionName || option.name] : newValue })
  }

  switch( option.type ) {
    case 'tab':
      return (<TabOptions option={option} changeOption={changeOption} shortSetSettings={shortSetSettings}/>)
    case 'input':
      return (<InputOption option={option} changeOption={changeOption}/>)
    case 'toggle':
      return ( <ToggleOption option={option} changeOption={changeOption}/>)
    case 'custom' :
      return option.render(changeOption)
  }
}

const ToggleOption = ({option, changeOption}) => {

  const handleToggle = () => changeOption(!option.enable);

  const contentStatus = option.enable ? 'Turn off' : 'Turn on';

  const badgeStatus = option.enable ? 'success' : undefined;

  const badgeContent = option.enable ? 'On' : 'Off';

  return (
      <Box borderColor="border" borderWidth="025" borderRadius={300} padding={400}>
        <InlineStack align="space-between" blockAlign="start">
          <BlockStack gap={100} inlineAlign='start'>
            <InlineStack gap={200}>
              <Text variant="headingMd" as="p">
                {option.label}
              </Text>
              <Badge
                tone={badgeStatus}
                toneAndProgressLabelOverride={`Setting is ${badgeContent}`}
              >
                {badgeContent}
              </Badge>
            </InlineStack>
            <Text tone="subdued" as="p"> {option.desc } </Text>
            { option.render && option.render(changeOption) }
            { option.learnMore && (<Button variant="plain">Learn more</Button>) }
          </BlockStack>
          <Button
            role="switch"
            id={option.name}
            ariaChecked={option.enable ? 'true' : 'false'}
            onClick={handleToggle}
            size="slim"
          >
            {contentStatus}
          </Button>
          {/*<ToggleSwitch name={option.name} checked={option.enable} changeOption={changeOption}/>*/}
        </InlineStack>
      </Box>
  );
}

const ToggleSwitch = ({name, checked, changeOption}) => {
  const handleChange = () => {
    changeOption( !checked );
  }

  return (
    <div className="toggle-switch">
      <input
          type="checkbox"
          id={name}
          className="toggle-switch-checkbox"
          name={name}
          checked={checked}
          onChange={handleChange}
      />
      <label className="toggle-switch-label" htmlFor={name}>
        <span className="toggle-switch-inner" />
        <span className="toggle-switch-switch" />
      </label>
    </div>
  );
}

const TabOptions = ({option, changeOption, shortSetSettings}) => {

  const [selected, setSelected] = useState(0);

  const handleTabChange = useCallback(
    (selectedTabIndex) => setSelected(selectedTabIndex),
    [],
  );
  const tabContent = (tab) => {
    return (
      <BlockStack gap="400">
        {tab.options.map( (option, index) => (
          <Option option={option} shortSetSettings={shortSetSettings} key={index}/>
        ))}
      </BlockStack>
    )
  }
  return (
     <Box borderColor="border" borderWidth="025" borderRadius="300" padding="400" paddingBlockStart="100">
       <BlockStack gap="400">
         <Tabs tabs={option.tabs} selected={selected} onSelect={handleTabChange} fitted/>
         {tabContent(option.tabContent[ selected ])}
        </BlockStack>
     </Box>
  )
}

const InputOption = ({option, changeOption}) => {

  const handleChange = (value) => {
    changeOption(value, option.name)
  }

  return (
    <TextField
      label={(<Text variant="headingSm" as="span"> {option.label} </Text>)}
      type={option.inputType}
      value={option.value}
      onChange={ value => handleChange(value)}
      helpText={option.desc}
      autoComplete={option.inputType}
    />
  )
}
