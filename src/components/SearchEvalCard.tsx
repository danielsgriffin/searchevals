// SearchEvalCard.tsx
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import DataContext, { evalPart } from './DataContext';
import { Link2Icon, InfoCircledIcon, DrawingPinIcon } from '@radix-ui/react-icons';
import SearchOnEvalInterface from './SearchOnEvalInterface';
import SearchBracket from './SearchBracket'
import '../styles/globals.css';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,} from './ui/card';
import EvalExtractCard from './EvalExtractCard'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
  
const SearchEvalCard: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data, systems, persons } = useContext(DataContext); // Destructure data from DataContext

  const evalItem = data ? data.find(evalItem => evalItem.id === id) : null;
  
  const evalPersonDetails = persons.find(person => person.id === evalItem?.person_id);
  

  if (!evalItem) {
    return <div>No data found for this ID</div>; // Return a valid JSX element
  }

  type conflictType = {
    name: string;
    searchLink: string;
    query: string;
    queryTooltip: JSX.Element
  };

  let conflicts: conflictType[] = [];
  if (evalPersonDetails && evalPersonDetails.conflict) {
    conflicts = evalPersonDetails.conflict.map(conflictId => {
      const system = systems.find(system => system.id === conflictId);
      let query= `How is ${evalPersonDetails.name} connected to ${system?.name}?`
      return {
        name: system!.name,
        searchLink: system!.search_link,
        query: query,
        queryTooltip: (         
          <><span>Click to start a <strong>{system?.name}</strong> search in a new tab:</span><SearchBracket className="not-italic text-sm">{query}</SearchBracket></>
          )};
    });
  }

  let systemsEvaluatedSearchLinks;
  if (systems && systems.length > 0 && evalItem.systems) {
    const encodedQuery = encodeURIComponent(evalItem.query);
    systemsEvaluatedSearchLinks = systems
      .filter(system => evalItem.systems!.includes(system.name)) // Filter systems based on evalItem.systems
      .map((system, index, filteredSystems) => { // Use filteredSystems for accurate indexing
        const systemLink = system.search_link; // Directly access the searchLink property of the system object
        return (
          <span key={system.id}> {/* Use system.id for a unique key */}
            <a className="underline" target="_blank" rel="noopener noreferrer" href={systemLink.replace('%s', encodedQuery)}>
              {system.name}
            </a>
            {index < filteredSystems.length - 1 ? ', ' : ''} {/* Use filteredSystems.length */}
          </span>
        );
      });
  } else {
    systemsEvaluatedSearchLinks = "";
  }

  
  let cardTitle = <div><SearchBracket><span className="text-xl">{evalItem.query}</span></SearchBracket></div>

  return (
    <div className="w-2/3 mx-auto mt-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>
            <SearchOnEvalInterface evalItem={evalItem} />
            {cardTitle}
            </CardTitle>
          <CardDescription>
            <a href={evalItem.url} target="_blank">{evalItem.url}</a>
            <p className="text-sm">systems: {systemsEvaluatedSearchLinks}</p>
            <p className="text-sm">date: {evalItem.date}</p>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {evalPersonDetails && (
            <figcaption className="mt-1 mb-2">
              <div className="flex items-center divide-x rtl:divide-x-reverse divide-gray-300 dark:divide-gray-700">
                <cite className="pe-3 ml-3 font-medium text-gray-900 dark:text-white">{evalPersonDetails.name}</cite>
                <cite className="ps-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="inline-flex"><a href={evalPersonDetails.URL} target="_blank" rel="noopener noreferrer"><InfoCircledIcon /></a></span>
                  <span className="ml-1">{evalPersonDetails.role}</span>
                  {conflicts && (
                    <><br></br>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger><span className="inline-flex"><DrawingPinIcon /></span></TooltipTrigger>
                          <TooltipContent>
                            <p>This evaluator person has a potential conflict-of-interest due to their relationship with the entities pinned to the right.</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      {conflicts.map((conflict, index) => (
                        <React.Fragment key={index}>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger><a className="underline ml-1" href={conflict.searchLink.replace('%s', encodeURIComponent(conflict.query).replace(/%20/g, '+'))} target="_blank" rel="noopener noreferrer">
                                {conflict.name}
                              </a>
                                {index < conflicts.length - 1 ? ', ' : ''}</TooltipTrigger>
                              <TooltipContent >
                                {conflict.queryTooltip}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </React.Fragment>
                      ))}
                    </>)}
                  </cite>
                </div>
                </figcaption>)}
          {evalItem.eval_parts ? (
            evalItem.eval_parts.map((part, index) => (
              <EvalExtractCard key={index} evalCardItem={part}/>
            ))
          ) : (
              <EvalExtractCard evalCardItem={evalItem}/>
          )}
        </CardContent>
        <CardFooter>
          <Link2Icon className="text-gray-500 dark:text-gray-400" /><small className="text-gray-500 dark:text-gray-500">Permalink id: <a className="underline" href={`/${evalItem!.id}`}>{evalItem!.id}</a></small>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SearchEvalCard;
